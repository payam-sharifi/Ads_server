import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../../entities/permission.entity';
import { AdminPermission } from '../../entities/admin-permission.entity';
import { User } from '../../entities/user.entity';
import { RoleType } from '../../entities/role.entity';

/**
 * PermissionsService
 * 
 * Handles permission management:
 * - Get all permissions
 * - Assign permissions to admins
 * - Revoke permissions from admins
 * - Check if user has permission
 */
@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(AdminPermission)
    private adminPermissionRepository: Repository<AdminPermission>,
  ) {}

  /**
   * Get all permissions
   */
  async findAll(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  /**
   * Get permission by name
   */
  async findByName(name: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({ where: { name } });
  }

  /**
   * Create a new permission
   */
  async create(resource: string, action: string, description?: string): Promise<Permission> {
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

  /**
   * Get admin's permissions
   */
  async getAdminPermissions(adminId: string): Promise<Permission[]> {
    const adminPermissions = await this.adminPermissionRepository.find({
      where: { adminId },
      relations: ['permission'],
    });

    return adminPermissions.map((ap) => ap.permission);
  }

  /**
   * Assign permission to admin
   */
  async assignPermission(adminId: string, permissionId: string): Promise<AdminPermission> {
    // Check if already assigned
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

  /**
   * Revoke permission from admin
   */
  async revokePermission(adminId: string, permissionId: string): Promise<void> {
    await this.adminPermissionRepository.delete({ adminId, permissionId });
  }

  /**
   * Check if user has permission
   * Super Admin always returns true
   */
  async hasPermission(user: User, permissionName: string): Promise<boolean> {
    // Super Admin has all permissions
    if (user.role.name === RoleType.SUPER_ADMIN) {
      return true;
    }

    // Only Admin can have permissions
    if (user.role.name !== RoleType.ADMIN) {
      return false;
    }

    const permissions = await this.getAdminPermissions(user.id);
    return permissions.some((p) => p.name === permissionName);
  }

  /**
   * Check if user has any of the permissions
   */
  async hasAnyPermission(user: User, permissionNames: string[]): Promise<boolean> {
    if (user.role.name === RoleType.SUPER_ADMIN) {
      return true;
    }

    if (user.role.name !== RoleType.ADMIN) {
      return false;
    }

    const permissions = await this.getAdminPermissions(user.id);
    const userPermissionNames = permissions.map((p) => p.name);

    return permissionNames.some((name) => userPermissionNames.includes(name));
  }
}

