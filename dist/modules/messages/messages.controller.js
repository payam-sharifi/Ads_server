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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const messages_service_1 = require("./messages.service");
const create_message_dto_1 = require("./dto/create-message.dto");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const roles_guard_1 = require("../../guards/roles.guard");
const permissions_guard_1 = require("../../guards/permissions.guard");
const roles_decorator_1 = require("../../decorators/roles.decorator");
const permissions_decorator_1 = require("../../decorators/permissions.decorator");
const role_entity_1 = require("../../entities/role.entity");
const current_user_decorator_1 = require("../../decorators/current-user.decorator");
const user_entity_1 = require("../../entities/user.entity");
let MessagesController = class MessagesController {
    constructor(messagesService) {
        this.messagesService = messagesService;
    }
    create(createMessageDto, user) {
        return this.messagesService.create(createMessageDto, user.id);
    }
    findByAd(adId, user) {
        return this.messagesService.findByAd(adId, user.id);
    }
    findMyInbox(user) {
        return this.messagesService.findByUser(user.id, user.role?.name);
    }
    async getUnreadCount(user) {
        const count = await this.messagesService.getUnreadCount(user.id);
        return { count };
    }
    markAsRead(id, user) {
        return this.messagesService.markAsRead(id, user.id);
    }
    async remove(id, user) {
        await this.messagesService.remove(id, user.id);
        return { message: 'Message deleted successfully' };
    }
    async findAllForSuperAdmin(page, limit, senderName, receiverName, startDate, endDate) {
        const filters = {
            page: page ? parseInt(page.toString(), 10) : undefined,
            limit: limit ? parseInt(limit.toString(), 10) : undefined,
            senderName,
            receiverName,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        };
        return this.messagesService.findAllWithFilters(filters);
    }
    async findAdminMessages(user, page, limit, senderName, receiverName, startDate, endDate) {
        const filters = {
            page: page ? parseInt(page.toString(), 10) : undefined,
            limit: limit ? parseInt(limit.toString(), 10) : undefined,
            senderName,
            receiverName,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        };
        return this.messagesService.findAdminMessages(user.id, filters);
    }
    async findByUserId(userId, page, limit) {
        const filters = {
            page: page ? parseInt(page.toString(), 10) : undefined,
            limit: limit ? parseInt(limit.toString(), 10) : undefined,
        };
        return this.messagesService.findByUserId(userId, filters);
    }
    findOneForAdmin(id) {
        return this.messagesService.findOneForAdmin(id);
    }
    findOne(id, user) {
        return this.messagesService.findOne(id, user.id);
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Send a message about an ad' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Message sent successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Cannot send message to yourself' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Ad not found' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_message_dto_1.CreateMessageDto, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('ad/:adId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all messages for an ad' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Messages retrieved successfully' }),
    __param(0, (0, common_1.Param)('adId', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "findByAd", null);
__decorate([
    (0, common_1.Get)('inbox/my'),
    (0, swagger_1.ApiOperation)({ summary: "Get current user's inbox" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Inbox retrieved successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "findMyInbox", null);
__decorate([
    (0, common_1.Get)('unread-count'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unread messages count' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Unread count retrieved successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Patch)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark message as read' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message marked as read' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a message' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Message not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('admin/all'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleType.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('messages.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all messages with filters (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Messages retrieved successfully' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('senderName')),
    __param(3, (0, common_1.Query)('receiverName')),
    __param(4, (0, common_1.Query)('startDate')),
    __param(5, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "findAllForSuperAdmin", null);
__decorate([
    (0, common_1.Get)('admin/my'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleType.ADMIN, role_entity_1.RoleType.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('messages.view'),
    (0, swagger_1.ApiOperation)({ summary: "Get admin's messages with filters" }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Messages retrieved successfully' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('senderName')),
    __param(4, (0, common_1.Query)('receiverName')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "findAdminMessages", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleType.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('messages.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all messages for a specific user (Super Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Messages retrieved successfully' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "findByUserId", null);
__decorate([
    (0, common_1.Get)('admin/:id'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard, permissions_guard_1.PermissionsGuard),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleType.ADMIN, role_entity_1.RoleType.SUPER_ADMIN),
    (0, permissions_decorator_1.Permissions)('messages.view'),
    (0, swagger_1.ApiOperation)({ summary: 'Get message by ID (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Message not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "findOneForAdmin", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get message by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Message retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "findOne", null);
exports.MessagesController = MessagesController = __decorate([
    (0, swagger_1.ApiTags)('Messages'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('messages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [messages_service_1.MessagesService])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map