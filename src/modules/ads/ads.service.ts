import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, IsNull } from 'typeorm';
import { Ad, AdStatus } from '../../entities/ad.entity';
import { User } from '../../entities/user.entity';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { FilterAdsDto } from './dto/filter-ads.dto';
import { ApproveAdDto } from './dto/approve-ad.dto';
import { RejectAdDto } from './dto/reject-ad.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../../entities/audit-log.entity';
import { RoleType } from '../../entities/role.entity';
import { MessagesService } from '../messages/messages.service';
import { PermissionsService } from '../permissions/permissions.service';

/**
 * Ads Service
 * 
 * Handles ad business logic:
 * - Create, read, update, delete ads
 * - Filter and paginate ads
 * - Ad approval workflow
 * - Increment view count
 */
@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(Ad)
    private adsRepository: Repository<Ad>,
    private auditLogService: AuditLogService,
    @Inject(forwardRef(() => MessagesService))
    private messagesService: MessagesService,
    @Inject(forwardRef(() => PermissionsService))
    private permissionsService: PermissionsService,
  ) {}

  /**
   * Find all ads with filtering and pagination
   * Public endpoint - only shows APPROVED ads
   * Admin endpoint - shows all ads based on filters
   */
  async findAll(filters: FilterAdsDto = {}, user?: User) {
    const {
      categoryId,
      subcategoryId,
      cityId,
      minPrice,
      maxPrice,
      status,
      search,
      userId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filters;

    const query = this.adsRepository.createQueryBuilder('ad');

    // Join relations
    query.leftJoinAndSelect('ad.user', 'user');
    query.leftJoinAndSelect('ad.category', 'category');
    query.leftJoinAndSelect('ad.subcategory', 'subcategory');
    query.leftJoinAndSelect('ad.city', 'city');
    query.leftJoinAndSelect('ad.images', 'images');

    // Apply filters - exclude soft-deleted ads
    // This ensures deleted ads are never shown in admin panel or public listings
    query.where('ad.deletedAt IS NULL');

    // Public users can only see APPROVED ads (not PENDING_APPROVAL, REJECTED, DRAFT, EXPIRED, or SUSPENDED)
    // Admins and Super Admins can see all statuses
    const isAdmin = user?.role?.name === RoleType.ADMIN || user?.role?.name === RoleType.SUPER_ADMIN;
    if (!isAdmin) {
      query.andWhere('ad.status = :status', { status: AdStatus.APPROVED });
    } else if (status) {
      query.andWhere('ad.status = :status', { status });
    }

    if (categoryId) {
      query.andWhere('ad.categoryId = :categoryId', { categoryId });
    }

    if (subcategoryId) {
      query.andWhere('ad.subcategoryId = :subcategoryId', { subcategoryId });
    }

    if (cityId) {
      query.andWhere('ad.cityId = :cityId', { cityId });
    }

    if (userId) {
      query.andWhere('ad.userId = :userId', { userId });
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      query.andWhere('ad.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice });
    } else if (minPrice !== undefined) {
      query.andWhere('ad.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      query.andWhere('ad.price <= :maxPrice', { maxPrice });
    }

    if (search) {
      query.andWhere(
        '(ad.title ILIKE :search OR ad.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Sorting
    const validSortFields = ['createdAt', 'updatedAt', 'price', 'views'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    query.orderBy(`ad.${sortField}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');

    // Pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find ad by ID with relations
   * Increments view count
   * Public users can only see APPROVED ads
   */
  async findOne(id: string, incrementViews = true, user?: User): Promise<Ad> {
    const ad = await this.adsRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['user', 'category', 'subcategory', 'city', 'images'],
    });

    if (!ad) {
      throw new NotFoundException(`Ad with ID ${id} not found`);
    }

    // Public users can only see APPROVED ads (not PENDING_APPROVAL, REJECTED, DRAFT, EXPIRED, or SUSPENDED)
    // Users can see their own ads regardless of status
    // Admins can see all ads
    const isAdmin = user?.role?.name === RoleType.ADMIN || user?.role?.name === RoleType.SUPER_ADMIN;
    const isOwner = user && ad.userId === user.id;

    if (!isAdmin && !isOwner && ad.status !== AdStatus.APPROVED) {
      throw new NotFoundException(`Ad with ID ${id} not found`);
    }

    // Increment view count
    if (incrementViews && ad.status === AdStatus.APPROVED) {
      ad.views += 1;
      await this.adsRepository.save(ad);
    }

    return ad;
  }

  /**
   * Create a new ad
   * Status defaults to PENDING_APPROVAL
   */
  async create(createAdDto: CreateAdDto, userId: string): Promise<Ad> {
    const ad = this.adsRepository.create({
      ...createAdDto,
      userId,
      status: AdStatus.PENDING_APPROVAL, // Always pending approval on creation
    });

    return this.adsRepository.save(ad);
  }

  /**
   * Update ad
   * Users can update their own ads (all statuses)
   * Admins can update any ad
   * If owner updates APPROVED or REJECTED ad, status changes to PENDING_APPROVAL
   * approvedAt is preserved when status changes back to PENDING_APPROVAL
   */
  async update(id: string, updateAdDto: UpdateAdDto, user: User): Promise<Ad> {
    const ad = await this.findOne(id, false, user);

    const isAdmin = user.role.name === RoleType.ADMIN || user.role.name === RoleType.SUPER_ADMIN;
    const isOwner = ad.userId === user.id;

    // Users can only update their own ads
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You can only update your own ads');
    }

    // Store original approvedAt before any changes
    const originalApprovedAt = ad.approvedAt;

    // If owner updates APPROVED or REJECTED ad, change status to PENDING_APPROVAL
    // and clear rejection reason, but preserve approvedAt
    if (!isAdmin && isOwner && (ad.status === AdStatus.APPROVED || ad.status === AdStatus.REJECTED)) {
      ad.status = AdStatus.PENDING_APPROVAL;
      ad.rejectionReason = null; // Clear rejection reason when resubmitting
      // Keep approvedAt unchanged - it will be preserved
    }

    // If admin is updating, log the action
    if (isAdmin && !isOwner) {
      await this.auditLogService.log({
        action: AuditAction.AD_EDITED,
        adminId: user.id,
        entityType: 'ad',
        entityId: id,
        oldValues: {
          title: ad.title,
          description: ad.description,
          price: ad.price,
        },
        newValues: updateAdDto,
        description: `Ad edited by admin: ${ad.title}`,
      });
    }

    Object.assign(ad, updateAdDto);
    
    // Preserve approvedAt if it existed before (don't overwrite it)
    if (originalApprovedAt) {
      ad.approvedAt = originalApprovedAt;
    }
    
    return this.adsRepository.save(ad);
  }

  /**
   * Approve ad (Admin/Super Admin with ads.approve permission)
   * Preserves original approvedAt if ad was previously approved
   */
  async approve(id: string, approveAdDto: ApproveAdDto, admin: User): Promise<Ad> {
    const ad = await this.findOne(id, false, admin);

    if (ad.status === AdStatus.APPROVED) {
      throw new BadRequestException('Ad is already approved');
    }

    // Preserve original approvedAt if it exists (don't overwrite it)
    const originalApprovedAt = ad.approvedAt;

    ad.status = AdStatus.APPROVED;
    ad.approvedBy = admin.id;
    // Only set approvedAt if it doesn't exist (first time approval)
    if (!originalApprovedAt) {
      ad.approvedAt = new Date();
    }
    ad.rejectionReason = null; // Clear rejection reason if any

    const savedAd = await this.adsRepository.save(ad);

    // Log action
    await this.auditLogService.log({
      action: AuditAction.AD_APPROVED,
      adminId: admin.id,
      entityType: 'ad',
      entityId: id,
      description: `Ad approved: ${ad.title}`,
    });

    return savedAd;
  }

  /**
   * Reject ad (Admin/Super Admin with ads.reject permission)
   * Automatically sends a message to the ad owner with the rejection reason
   */
  async reject(id: string, rejectAdDto: RejectAdDto, admin: User): Promise<Ad> {
    const ad = await this.findOne(id, false, admin);

    if (ad.status === AdStatus.REJECTED) {
      throw new BadRequestException('Ad is already rejected');
    }

    if (!rejectAdDto.reason || rejectAdDto.reason.trim().length === 0) {
      throw new BadRequestException('Rejection reason is required');
    }

    ad.status = AdStatus.REJECTED;
    ad.rejectedBy = admin.id;
    ad.rejectedAt = new Date();
    ad.rejectionReason = rejectAdDto.reason;

    const savedAd = await this.adsRepository.save(ad);

    // Log action
    await this.auditLogService.log({
      action: AuditAction.AD_REJECTED,
      adminId: admin.id,
      entityType: 'ad',
      entityId: id,
      newValues: { rejectionReason: rejectAdDto.reason },
      description: `Ad rejected: ${ad.title}`,
    });

    // Send message to ad owner about rejection
    try {
      await this.messagesService.create(
        {
          adId: id,
          messageText: `Your ad "${ad.title}" has been rejected.\n\nReason: ${rejectAdDto.reason}\n\nPlease review and resubmit if needed.`,
        },
        admin.id, // Admin is the sender
      );
    } catch (error) {
      // Log error but don't fail the rejection
      console.error('Failed to send rejection message to ad owner:', error);
    }

    return savedAd;
  }

  /**
   * Delete ad (soft delete)
   * Only ad owner or admin with ads.delete permission can delete
   */
  async remove(id: string, user: User): Promise<void> {
    const ad = await this.findOne(id, false, user);

    const isAdmin = user.role?.name === RoleType.ADMIN || user.role?.name === RoleType.SUPER_ADMIN;
    const isOwner = ad.userId === user.id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You can only delete your own ads');
    }

    // For admins (not owners), check if they have ads.delete permission
    // Super Admin always has all permissions
    // Owners can always delete their own ads
    if (isAdmin && !isOwner) {
      const hasDeletePermission = await this.permissionsService.hasPermission(user, 'ads.delete');
      if (!hasDeletePermission) {
        throw new ForbiddenException('You do not have permission to delete ads');
      }
    }

    ad.deletedAt = new Date();
    await this.adsRepository.save(ad);

    // Log action if admin
    if (isAdmin && !isOwner) {
      await this.auditLogService.log({
        action: AuditAction.AD_DELETED,
        adminId: user.id,
        entityType: 'ad',
        entityId: id,
        description: `Ad deleted by admin: ${ad.title}`,
      });
    }
  }

  /**
   * Suspend ad (Admin/Super Admin only)
   * Temporarily hides the ad from public view
   */
  async suspend(id: string, admin: User): Promise<Ad> {
    const ad = await this.findOne(id, false, admin);

    if (ad.status === AdStatus.SUSPENDED) {
      throw new BadRequestException('Ad is already suspended');
    }

    const previousStatus = ad.status;
    ad.status = AdStatus.SUSPENDED;

    const savedAd = await this.adsRepository.save(ad);

    // Log action
    await this.auditLogService.log({
      action: AuditAction.AD_EDITED,
      adminId: admin.id,
      entityType: 'ad',
      entityId: id,
      oldValues: { status: previousStatus },
      newValues: { status: AdStatus.SUSPENDED },
      description: `Ad suspended: ${ad.title}`,
    });

    return savedAd;
  }

  /**
   * Unsuspend ad (Admin/Super Admin only)
   * Restores the ad to its previous status or APPROVED
   */
  async unsuspend(id: string, admin: User): Promise<Ad> {
    const ad = await this.findOne(id, false, admin);

    if (ad.status !== AdStatus.SUSPENDED) {
      throw new BadRequestException('Ad is not suspended');
    }

    // Restore to APPROVED if it was previously approved, otherwise keep as PENDING_APPROVAL
    ad.status = ad.approvedAt ? AdStatus.APPROVED : AdStatus.PENDING_APPROVAL;

    const savedAd = await this.adsRepository.save(ad);

    // Log action
    await this.auditLogService.log({
      action: AuditAction.AD_EDITED,
      adminId: admin.id,
      entityType: 'ad',
      entityId: id,
      oldValues: { status: AdStatus.SUSPENDED },
      newValues: { status: ad.status },
      description: `Ad unsuspended: ${ad.title}`,
    });

    return savedAd;
  }

  /**
   * Get ads by user ID
   * Returns all statuses for the user's own ads
   */
  async findByUser(userId: string, requestingUser?: User): Promise<Ad[]> {
    // Users can only see their own ads
    // Admins can see any user's ads
    const isAdmin = requestingUser?.role?.name === RoleType.ADMIN || requestingUser?.role?.name === RoleType.SUPER_ADMIN;
    const isOwner = requestingUser && userId === requestingUser.id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You can only view your own ads');
    }

    return this.adsRepository.find({
      where: { userId, deletedAt: IsNull() },
      relations: ['category', 'subcategory', 'city', 'images'],
      order: { createdAt: 'DESC' },
    });
  }
}
