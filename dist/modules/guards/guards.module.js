"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardsModule = void 0;
const common_1 = require("@nestjs/common");
const permissions_guard_1 = require("../../guards/permissions.guard");
const roles_guard_1 = require("../../guards/roles.guard");
const jwt_auth_guard_1 = require("../../guards/jwt-auth.guard");
const permissions_module_1 = require("../permissions/permissions.module");
const users_module_1 = require("../users/users.module");
let GuardsModule = class GuardsModule {
};
exports.GuardsModule = GuardsModule;
exports.GuardsModule = GuardsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [permissions_module_1.PermissionsModule, (0, common_1.forwardRef)(() => users_module_1.UsersModule)],
        providers: [permissions_guard_1.PermissionsGuard, roles_guard_1.RolesGuard, jwt_auth_guard_1.JwtAuthGuard],
        exports: [permissions_guard_1.PermissionsGuard, roles_guard_1.RolesGuard, jwt_auth_guard_1.JwtAuthGuard, permissions_module_1.PermissionsModule],
    })
], GuardsModule);
//# sourceMappingURL=guards.module.js.map