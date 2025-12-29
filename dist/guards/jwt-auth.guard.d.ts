import { ExecutionContext } from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';
declare const JwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class JwtAuthGuard extends JwtAuthGuard_base {
    private reflector;
    private moduleRef;
    private isPublicRoute;
    constructor(reflector: Reflector, moduleRef: ModuleRef);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export {};
