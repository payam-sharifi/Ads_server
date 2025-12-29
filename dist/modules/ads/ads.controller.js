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
exports.AdsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ads_service_1 = require("./ads.service");
const create_ad_dto_1 = require("./dto/create-ad.dto");
const update_ad_dto_1 = require("./dto/update-ad.dto");
const filter_ads_dto_1 = require("./dto/filter-ads.dto");
const approve_ad_dto_1 = require("./dto/approve-ad.dto");
const reject_ad_dto_1 = require("./dto/reject-ad.dto");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const roles_guard_1 = require("../../guards/roles.guard");
const permissions_guard_1 = require("../../guards/permissions.guard");
const roles_decorator_1 = require("../../decorators/roles.decorator");
const permissions_decorator_1 = require("../../decorators/permissions.decorator");
const role_entity_1 = require("../../entities/role.entity");
const current_user_decorator_1 = require("../../decorators/current-user.decorator");
const user_entity_1 = require("../../entities/user.entity");
const public_decorator_1 = require("../../decorators/public.decorator");
let AdsController = class AdsController {
    constructor(adsService) {
        this.adsService = adsService;
    }
    findAll(filters, user) {
        return this.adsService.findAll(filters, user);
    }
    findOne(id, user) {
        return this.adsService.findOne(id, true, user);
    }
    findMyAds(user) {
        return this.adsService.findByUser(user.id, user);
    }
    findUserAds(userId, user) {
        return this.adsService.findByUser(userId, user);
    }
    approve(id, approveAdDto, user) {
        return this.adsService.approve(id, approveAdDto, user);
    }
    reject(id, rejectAdDto, user) {
        return this.adsService.reject(id, rejectAdDto, user);
    }
    create(createAdDto, user) {
        return this.adsService.create(createAdDto, user.id);
    }
    update(id, updateAdDto, user) {
        return this.adsService.update(id, updateAdDto, user);
    }
    suspend(id, user) {
        return this.adsService.suspend(id, user);
    }
    unsuspend(id, user) {
        return this.adsService.unsuspend(id, user);
    }
    remove(id, user) {
        return this.adsService.remove(id, user);
    }
};
exports.AdsController = AdsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all ads with filtering and pagination' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ads retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_ads_dto_1.FilterAdsDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AdsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get ad by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ad retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ad not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AdsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('user/my'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: "Get current user's ads" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User ads retrieved successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AdsController.prototype, "findMyAds", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: "Get user's ads (own ads or admin)" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User ads retrieved successfully' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AdsController.prototype, "findUserAds", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleType.ADMIN, role_entity_1.RoleType.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('ads.approve'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve ad (Admin/Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ad approved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Insufficient permissions' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approve_ad_dto_1.ApproveAdDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AdsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleType.ADMIN, role_entity_1.RoleType.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('ads.reject'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject ad (Admin/Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ad rejected successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Insufficient permissions' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, reject_ad_dto_1.RejectAdDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AdsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new ad' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ad created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_ad_dto_1.CreateAdDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AdsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Update ad (owner or admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ad updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_ad_dto_1.UpdateAdDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AdsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/suspend'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleType.ADMIN, role_entity_1.RoleType.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('ads.edit'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend ad (Admin/Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ad suspended successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Insufficient permissions' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AdsController.prototype, "suspend", null);
__decorate([
    (0, common_1.Post)(':id/unsuspend'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleType.ADMIN, role_entity_1.RoleType.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('ads.edit'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Unsuspend ad (Admin/Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ad unsuspended successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - Insufficient permissions' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AdsController.prototype, "unsuspend", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete ad (owner or admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Ad deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AdsController.prototype, "remove", null);
exports.AdsController = AdsController = __decorate([
    (0, swagger_1.ApiTags)('Ads'),
    (0, common_1.Controller)('ads'),
    __metadata("design:paramtypes", [ads_service_1.AdsService])
], AdsController);
//# sourceMappingURL=ads.controller.js.map