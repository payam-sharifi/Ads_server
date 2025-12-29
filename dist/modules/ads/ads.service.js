"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ad_entity_1 = require("../../entities/ad.entity");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const audit_log_entity_1 = require("../../entities/audit-log.entity");
const role_entity_1 = require("../../entities/role.entity");
const messages_service_1 = require("../messages/messages.service");
let AdsService = class AdsService {
    constructor(adsRepository, auditLogService, messagesService) {
        this.adsRepository = adsRepository;
        this.auditLogService = auditLogService;
        this.messagesService = messagesService;
    }
    async findAll(filters = {}, user) {
        const { categoryId, subcategoryId, cityId, minPrice, maxPrice, status, search, userId, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', } = filters;
        const query = this.adsRepository.createQueryBuilder('ad');
        query.leftJoinAndSelect('ad.user', 'user');
        query.leftJoinAndSelect('ad.category', 'category');
        query.leftJoinAndSelect('ad.subcategory', 'subcategory');
        query.leftJoinAndSelect('ad.city', 'city');
        query.leftJoinAndSelect('ad.images', 'images');
        query.where('ad.deletedAt IS NULL');
        const isAdmin = user?.role?.name === role_entity_1.RoleType.ADMIN || user?.role?.name === role_entity_1.RoleType.SUPER_ADMIN;
        if (!isAdmin) {
            query.andWhere('ad.status = :status', { status: ad_entity_1.AdStatus.APPROVED });
        }
        else if (status) {
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
        }
        else if (minPrice !== undefined) {
            query.andWhere('ad.price >= :minPrice', { minPrice });
        }
        else if (maxPrice !== undefined) {
            query.andWhere('ad.price <= :maxPrice', { maxPrice });
        }
        if (search) {
            query.andWhere('(ad.title ILIKE :search OR ad.description ILIKE :search)', { search: `%${search}%` });
        }
        const validSortFields = ['createdAt', 'updatedAt', 'price', 'views'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
        query.orderBy(`ad.${sortField}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');
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
    async findOne(id, incrementViews = true, user) {
        const ad = await this.adsRepository.findOne({
            where: { id, deletedAt: null },
            relations: ['user', 'category', 'subcategory', 'city', 'images'],
        });
        if (!ad) {
            throw new common_1.NotFoundException(`Ad with ID ${id} not found`);
        }
        const isAdmin = user?.role?.name === role_entity_1.RoleType.ADMIN || user?.role?.name === role_entity_1.RoleType.SUPER_ADMIN;
        const isOwner = user && ad.userId === user.id;
        if (!isAdmin && !isOwner && ad.status !== ad_entity_1.AdStatus.APPROVED) {
            throw new common_1.NotFoundException(`Ad with ID ${id} not found`);
        }
        if (incrementViews && ad.status === ad_entity_1.AdStatus.APPROVED) {
            ad.views += 1;
            await this.adsRepository.save(ad);
        }
        return ad;
    }
    async create(createAdDto, userId) {
        const ad = this.adsRepository.create({
            ...createAdDto,
            userId,
            status: ad_entity_1.AdStatus.PENDING_APPROVAL,
        });
        return this.adsRepository.save(ad);
    }
    async update(id, updateAdDto, user) {
        const ad = await this.findOne(id, false, user);
        const isAdmin = user.role.name === role_entity_1.RoleType.ADMIN || user.role.name === role_entity_1.RoleType.SUPER_ADMIN;
        const isOwner = ad.userId === user.id;
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('You can only update your own ads');
        }
        if (!isAdmin && isOwner && (ad.status === ad_entity_1.AdStatus.APPROVED || ad.status === ad_entity_1.AdStatus.REJECTED)) {
            throw new common_1.ForbiddenException('Cannot update approved or rejected ads');
        }
        if (isAdmin && !isOwner) {
            await this.auditLogService.log({
                action: audit_log_entity_1.AuditAction.AD_EDITED,
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
        return this.adsRepository.save(ad);
    }
    async approve(id, approveAdDto, admin) {
        const ad = await this.findOne(id, false, admin);
        if (ad.status === ad_entity_1.AdStatus.APPROVED) {
            throw new common_1.BadRequestException('Ad is already approved');
        }
        ad.status = ad_entity_1.AdStatus.APPROVED;
        ad.approvedBy = admin.id;
        ad.approvedAt = new Date();
        ad.rejectionReason = null;
        const savedAd = await this.adsRepository.save(ad);
        await this.auditLogService.log({
            action: audit_log_entity_1.AuditAction.AD_APPROVED,
            adminId: admin.id,
            entityType: 'ad',
            entityId: id,
            description: `Ad approved: ${ad.title}`,
        });
        return savedAd;
    }
    async reject(id, rejectAdDto, admin) {
        const ad = await this.findOne(id, false, admin);
        if (ad.status === ad_entity_1.AdStatus.REJECTED) {
            throw new common_1.BadRequestException('Ad is already rejected');
        }
        if (!rejectAdDto.reason || rejectAdDto.reason.trim().length === 0) {
            throw new common_1.BadRequestException('Rejection reason is required');
        }
        ad.status = ad_entity_1.AdStatus.REJECTED;
        ad.rejectedBy = admin.id;
        ad.rejectedAt = new Date();
        ad.rejectionReason = rejectAdDto.reason;
        const savedAd = await this.adsRepository.save(ad);
        await this.auditLogService.log({
            action: audit_log_entity_1.AuditAction.AD_REJECTED,
            adminId: admin.id,
            entityType: 'ad',
            entityId: id,
            newValues: { rejectionReason: rejectAdDto.reason },
            description: `Ad rejected: ${ad.title}`,
        });
        try {
            await this.messagesService.create({
                adId: id,
                messageText: `Your ad "${ad.title}" has been rejected.\n\nReason: ${rejectAdDto.reason}\n\nPlease review and resubmit if needed.`,
            }, admin.id);
        }
        catch (error) {
            console.error('Failed to send rejection message to ad owner:', error);
        }
        return savedAd;
    }
    async remove(id, user) {
        const ad = await this.findOne(id, false, user);
        const isAdmin = user.role?.name === role_entity_1.RoleType.ADMIN || user.role?.name === role_entity_1.RoleType.SUPER_ADMIN;
        const isOwner = ad.userId === user.id;
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('You can only delete your own ads');
        }
        ad.deletedAt = new Date();
        await this.adsRepository.save(ad);
        if (isAdmin) {
            await this.auditLogService.log({
                action: audit_log_entity_1.AuditAction.AD_DELETED,
                adminId: user.id,
                entityType: 'ad',
                entityId: id,
                description: `Ad deleted by admin: ${ad.title}`,
            });
        }
    }
    async suspend(id, admin) {
        const ad = await this.findOne(id, false, admin);
        if (ad.status === ad_entity_1.AdStatus.SUSPENDED) {
            throw new common_1.BadRequestException('Ad is already suspended');
        }
        const previousStatus = ad.status;
        ad.status = ad_entity_1.AdStatus.SUSPENDED;
        const savedAd = await this.adsRepository.save(ad);
        await this.auditLogService.log({
            action: audit_log_entity_1.AuditAction.AD_EDITED,
            adminId: admin.id,
            entityType: 'ad',
            entityId: id,
            oldValues: { status: previousStatus },
            newValues: { status: ad_entity_1.AdStatus.SUSPENDED },
            description: `Ad suspended: ${ad.title}`,
        });
        return savedAd;
    }
    async unsuspend(id, admin) {
        const ad = await this.findOne(id, false, admin);
        if (ad.status !== ad_entity_1.AdStatus.SUSPENDED) {
            throw new common_1.BadRequestException('Ad is not suspended');
        }
        ad.status = ad.approvedAt ? ad_entity_1.AdStatus.APPROVED : ad_entity_1.AdStatus.PENDING_APPROVAL;
        const savedAd = await this.adsRepository.save(ad);
        await this.auditLogService.log({
            action: audit_log_entity_1.AuditAction.AD_EDITED,
            adminId: admin.id,
            entityType: 'ad',
            entityId: id,
            oldValues: { status: ad_entity_1.AdStatus.SUSPENDED },
            newValues: { status: ad.status },
            description: `Ad unsuspended: ${ad.title}`,
        });
        return savedAd;
    }
    async findByUser(userId, requestingUser) {
        const isAdmin = requestingUser?.role?.name === role_entity_1.RoleType.ADMIN || requestingUser?.role?.name === role_entity_1.RoleType.SUPER_ADMIN;
        const isOwner = requestingUser && userId === requestingUser.id;
        if (!isAdmin && !isOwner) {
            throw new common_1.ForbiddenException('You can only view your own ads');
        }
        return this.adsRepository.find({
            where: { userId, deletedAt: (0, typeorm_2.IsNull)() },
            relations: ['category', 'subcategory', 'city', 'images'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.AdsService = AdsService;
exports.AdsService = AdsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ad_entity_1.Ad)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => messages_service_1.MessagesService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        audit_log_service_1.AuditLogService,
        messages_service_1.MessagesService])
], AdsService);
//# sourceMappingURL=ads.service.js.map