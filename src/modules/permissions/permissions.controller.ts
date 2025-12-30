import { Controller, Get, Post, Delete, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { RoleType } from '../../entities/role.entity';
import { Permissions } from '../../decorators/permissions.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('Permissions')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  @ApiOperation({ summary: 'Get all permissions' })
  async findAll() {
    return this.permissionsService.findAll();
  }

  @Get('admin/:adminId')
  @Roles(RoleType.SUPER_ADMIN, RoleType.ADMIN)
  @ApiOperation({ summary: 'Get admin permissions (Super Admin or own permissions)' })
  async getAdminPermissions(@Param('adminId') adminId: string, @CurrentUser() user: User) {
    // Super Admin can see any admin's permissions
    // Regular Admin can only see their own permissions
    if (user.role.name !== RoleType.SUPER_ADMIN && user.id !== adminId) {
      throw new ForbiddenException('You can only view your own permissions');
    }
    return this.permissionsService.getAdminPermissions(adminId);
  }

  @Post('assign')
  @Roles(RoleType.SUPER_ADMIN)
  @Permissions('admins.manage')
  @ApiOperation({ summary: 'Assign permission to admin (Super Admin only)' })
  async assignPermission(@Body() body: { adminId: string; permissionId: string }) {
    return this.permissionsService.assignPermission(body.adminId, body.permissionId);
  }

  @Delete('revoke')
  @Roles(RoleType.SUPER_ADMIN)
  @Permissions('admins.manage')
  @ApiOperation({ summary: 'Revoke permission from admin (Super Admin only)' })
  async revokePermission(@Body() body: { adminId: string; permissionId: string }) {
    await this.permissionsService.revokePermission(body.adminId, body.permissionId);
    return { message: 'Permission revoked successfully' };
  }
}

