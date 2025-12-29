import { Repository } from 'typeorm';
import { Permission } from '../../entities/permission.entity';
import { AdminPermission } from '../../entities/admin-permission.entity';
import { User } from '../../entities/user.entity';
export declare class PermissionsService {
    private permissionRepository;
    private adminPermissionRepository;
    constructor(permissionRepository: Repository<Permission>, adminPermissionRepository: Repository<AdminPermission>);
    findAll(): Promise<Permission[]>;
    findByName(name: string): Promise<Permission | null>;
    create(resource: string, action: string, description?: string): Promise<Permission>;
    getAdminPermissions(adminId: string): Promise<Permission[]>;
    assignPermission(adminId: string, permissionId: string): Promise<AdminPermission>;
    revokePermission(adminId: string, permissionId: string): Promise<void>;
    hasPermission(user: User, permissionName: string): Promise<boolean>;
    hasAnyPermission(user: User, permissionNames: string[]): Promise<boolean>;
}
