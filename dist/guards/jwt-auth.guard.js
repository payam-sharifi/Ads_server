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
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const core_1 = require("@nestjs/core");
const public_decorator_1 = require("../decorators/public.decorator");
const users_service_1 = require("../modules/users/users.service");
const passport_jwt_1 = require("passport-jwt");
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('jwt') {
    constructor(reflector, moduleRef) {
        super();
        this.reflector = reflector;
        this.moduleRef = moduleRef;
        this.isPublicRoute = false;
    }
    async canActivate(context) {
        this.isPublicRoute = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (this.isPublicRoute) {
            const request = context.switchToHttp().getRequest();
            try {
                const extractJwt = passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken();
                const token = extractJwt(request);
                if (token) {
                    const jwt = require('jsonwebtoken');
                    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
                    const payload = jwt.verify(token, secret);
                    const usersService = this.moduleRef.get(users_service_1.UsersService, { strict: false });
                    const user = await usersService.findOneWithRole(payload.sub);
                    if (user && !user.isBlocked && (!user.isSuspended || !user.suspendedUntil || user.suspendedUntil <= new Date())) {
                        request.user = user;
                    }
                }
            }
            catch (error) {
            }
            return true;
        }
        const result = await super.canActivate(context);
        return result;
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        core_1.ModuleRef])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map