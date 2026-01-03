import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector, ModuleRef } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UsersService } from '../modules/users/users.service';
import { ExtractJwt } from 'passport-jwt';

/**
 * JwtAuthGuard - Extends Passport JWT guard
 * Allows public routes to bypass authentication, but still tries to extract user if token is provided
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private isPublicRoute = false;

  constructor(
    private reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // #region agent log
    const request = context.switchToHttp().getRequest();
    fetch('http://127.0.0.1:7246/ingest/fe4c5ec4-2787-4be7-9054-016ec7118181',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jwt-auth.guard.ts:23',message:'JwtAuthGuard canActivate called',data:{method:request.method,url:request.url,path:request.path},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    this.isPublicRoute = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/fe4c5ec4-2787-4be7-9054-016ec7118181',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jwt-auth.guard.ts:28',message:'Public route check',data:{isPublicRoute:this.isPublicRoute},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    if (this.isPublicRoute) {
      // For public routes, still try to authenticate if token is provided
      // This allows admins to see all ads even on public endpoints
      const request = context.switchToHttp().getRequest();
      
      // Try to extract and validate JWT token manually
      try {
        const extractJwt = ExtractJwt.fromAuthHeaderAsBearerToken();
        const token = extractJwt(request);
        
        if (token) {
          // Validate token and get user
          const jwt = require('jsonwebtoken');
          const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
          const payload = jwt.verify(token, secret);
          
          // Get user with role using ModuleRef to avoid circular dependency
          const usersService = this.moduleRef.get(UsersService, { strict: false });
          const user = await usersService.findOneWithRole(payload.sub);
          
          if (user && !user.isBlocked && (!user.isSuspended || !user.suspendedUntil || user.suspendedUntil <= new Date())) {
            request.user = user;
          }
        }
      } catch (error) {
        // Token is invalid or missing, that's OK for public routes
        // request.user will remain undefined
      }
      
      // Always allow public routes to proceed
      return true;
    }

    const result = await super.canActivate(context);
    return result as boolean;
  }
}
