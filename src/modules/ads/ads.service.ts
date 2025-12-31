import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, IsNull } from 'typeorm';
import { Ad, AdStatus } from '../../entities/ad.entity';
import { User } from '../../entities/user.entity';
import { Bookmark } from '../../entities/bookmark.entity';
import { Category } from '../../entities/category.entity';
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
import { CategoryValidatorService } from './validators/category-validator.service';

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
    @InjectRepository(Bookmark)
    private bookmarksRepository: Repository<Bookmark>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    private auditLogService: AuditLogService,
    private categoryValidatorService: CategoryValidatorService,
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
   * Validates category-specific fields based on category type
   */
  async create(createAdDto: CreateAdDto, userId: string): Promise<Ad> {
    // Verify category exists and get its type
    const category = await this.categoriesRepository.findOne({
      where: { id: createAdDto.categoryId, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${createAdDto.categoryId} not found`);
    }

    if (!category.categoryType) {
      throw new BadRequestException('Category must be one of the 4 main categories (real_estate, vehicles, services, jobs)');
    }

    // Validate category-specific fields
    const metadata = await this.categoryValidatorService.validateCategoryFields(
      createAdDto,
      category.categoryType,
    );

    // For jobs, use jobTitle as title if provided
    let title = createAdDto.title;
    if (category.categoryType === 'jobs' && metadata.jobTitle) {
      title = metadata.jobTitle;
    }

    // For jobs, use jobDescription as description if provided
    let description = createAdDto.description;
    if (category.categoryType === 'jobs' && metadata.jobDescription) {
      description = metadata.jobDescription;
    }

    // Determine price based on category
    let price = createAdDto.price || 0;
    if (category.categoryType === 'real_estate') {
      price = metadata.price || metadata.coldRent || 0;
    } else if (category.categoryType === 'vehicles') {
      price = createAdDto.price || 0;
    } else if (category.categoryType === 'services') {
      price = metadata.price || 0;
    } else if (category.categoryType === 'jobs') {
      price = 0; // Jobs don't have price
    }

    // Create ad with validated metadata
    const ad = this.adsRepository.create({
      title,
      description,
      price,
      categoryId: createAdDto.categoryId,
      cityId: createAdDto.cityId,
      userId,
      status: AdStatus.PENDING_APPROVAL,
      condition: createAdDto.condition,
      metadata,
      showEmail: createAdDto.showEmail || false,
      showPhone: createAdDto.showPhone || false,
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

  /**
   * Bookmark an ad
   */
  async bookmarkAd(adId: string, userId: string): Promise<Bookmark> {
    // Check if ad exists
    const ad = await this.adsRepository.findOne({
      where: { id: adId, deletedAt: IsNull() },
    });

    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    // Check if already bookmarked
    const existingBookmark = await this.bookmarksRepository.findOne({
      where: { adId, userId },
    });

    if (existingBookmark) {
      return existingBookmark; // Already bookmarked
    }

    // Create new bookmark
    const bookmark = this.bookmarksRepository.create({
      adId,
      userId,
    });

    return this.bookmarksRepository.save(bookmark);
  }

  /**
   * Remove bookmark from an ad
   */
  async unbookmarkAd(adId: string, userId: string): Promise<void> {
    const bookmark = await this.bookmarksRepository.findOne({
      where: { adId, userId },
    });

    if (!bookmark) {
      throw new NotFoundException('Bookmark not found');
    }

    await this.bookmarksRepository.remove(bookmark);
  }

  /**
   * Get user's bookmarked ads
   */
  async getBookmarkedAds(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await this.bookmarksRepository.findAndCount({
      where: { userId },
      relations: ['ad', 'ad.category', 'ad.subcategory', 'ad.city', 'ad.images', 'ad.user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    // Filter out deleted ads
    const validBookmarks = bookmarks.filter((bookmark) => !bookmark.ad.deletedAt);
    const ads = validBookmarks.map((bookmark) => bookmark.ad);

    return {
      data: ads,
      pagination: {
        total: validBookmarks.length,
        page,
        limit,
        totalPages: Math.ceil(validBookmarks.length / limit),
      },
    };
  }

  /**
   * Check if ad is bookmarked by user
   */
  async isBookmarked(adId: string, userId: string): Promise<boolean> {
    const bookmark = await this.bookmarksRepository.findOne({
      where: { adId, userId },
    });

    return !!bookmark;
  }
}
