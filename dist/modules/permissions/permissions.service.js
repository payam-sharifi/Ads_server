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
exports.PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const permission_entity_1 = require("../../entities/permission.entity");
const admin_permission_entity_1 = require("../../entities/admin-permission.entity");
const role_entity_1 = require("../../entities/role.entity");
let PermissionsService = class PermissionsService {
    constructor(permissionRepository, adminPermissionRepository) {
        this.permissionRepository = permissionRepository;
        this.adminPermissionRepository = adminPermissionRepository;
    }
    async findAll() {
        return this.permissionRepository.find({
            order: { resource: 'ASC', action: 'ASC' },
        });
    }
    async findByName(name) {
        return this.permissionRepository.findOne({ where: { name } });
    }
    async create(resource, action, description) {
        const name = `${resource}.${action}`;
        const existing = await this.findByName(name);
        if (existing) {
            return existing;
        }
        const permission = this.permissionRepository.create({
            name,
            resource,
            action,
            description,
        });
        return this.permissionRepository.save(permission);
    }
    async getAdminPermissions(adminId) {
        const adminPermissions = await this.adminPermissionRepository.find({
            where: { adminId },
            relations: ['permission'],
        });
        return adminPermissions.map((ap) => ap.permission);
    }
    async assignPermission(adminId, permissionId) {
        const existing = await this.adminPermissionRepository.findOne({
            where: { adminId, permissionId },
        });
        if (existing) {
            return existing;
        }
        const adminPermission = this.adminPermissionRepository.create({
            adminId,
            permissionId,
        });
        return this.adminPermissionRepository.save(adminPermission);
    }
    async revokePermission(adminId, permissionId) {
        await this.adminPermissionRepository.delete({ adminId, permissionId });
    }
    async hasPermission(user, permissionName) {
        if (user.role.name === role_entity_1.RoleType.SUPER_ADMIN) {
            return true;
        }
        if (user.role.name !== role_entity_1.RoleType.ADMIN) {
            return false;
        }
        const permissions = await this.getAdminPermissions(user.id);
        return permissions.some((p) => p.name === permissionName);
    }
    async hasAnyPermission(user, permissionNames) {
        if (user.role.name === role_entity_1.RoleType.SUPER_ADMIN) {
            return true;
        }
        if (user.role.name !== role_entity_1.RoleType.ADMIN) {
            return false;
        }
        const permissions = await this.getAdminPermissions(user.id);
        const userPermissionNames = permissions.map((p) => p.name);
        return permissionNames.some((name) => userPermissionNames.includes(name));
    }
};
exports.PermissionsService = PermissionsService;
exports.PermissionsService = PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __param(1, (0, typeorm_1.InjectRepository)(admin_permission_entity_1.AdminPermission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PermissionsService);
//# sourceMappingURL=permissions.service.js.map