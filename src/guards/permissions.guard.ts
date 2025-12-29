import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RoleType } from '../entities/role.entity';
import { PermissionsService } from '../modules/permissions/permissions.service';

/**
 * PermissionsGuard - Checks if user has required permissions
 * 
 * Super Admin has all permissions by default
 * Admin users must have the permission assigned
 * Regular users cannot have permissions
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('User role not found');
    }

    // Super Admin has all permissions
    if (user.role.name === RoleType.SUPER_ADMIN) {
      return true;
    }

    // Only Admin can have permissions
    if (user.role.name !== RoleType.ADMIN) {
      throw new ForbiddenException('Only admins can have permissions');
    }

    // Check if user has all required permissions
    // We need to check that user has ALL permissions, not just ANY
    const userPermissions = await this.permissionsService.getAdminPermissions(user.id);
    const userPermissionNames = userPermissions.map((p) => p.name);
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissionNames.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

