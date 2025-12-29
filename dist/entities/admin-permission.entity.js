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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPermission = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const permission_entity_1 = require("./permission.entity");
let AdminPermission = class AdminPermission {
};
exports.AdminPermission = AdminPermission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AdminPermission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'admin_id' }),
    __metadata("design:type", String)
], AdminPermission.prototype, "adminId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'permission_id' }),
    __metadata("design:type", String)
], AdminPermission.prototype, "permissionId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', name: 'created_at' }),
    __metadata("design:type", Date)
], AdminPermission.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.adminPermissions),
    (0, typeorm_1.JoinColumn)({ name: 'admin_id' }),
    __metadata("design:type", user_entity_1.User)
], AdminPermission.prototype, "admin", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => permission_entity_1.Permission, (permission) => permission.adminPermissions),
    (0, typeorm_1.JoinColumn)({ name: 'permission_id' }),
    __metadata("design:type", permission_entity_1.Permission)
], AdminPermission.prototype, "permission", void 0);
exports.AdminPermission = AdminPermission = __decorate([
    (0, typeorm_1.Entity)('admin_permissions')
], AdminPermission);
//# sourceMappingURL=admin-permission.entity.js.map