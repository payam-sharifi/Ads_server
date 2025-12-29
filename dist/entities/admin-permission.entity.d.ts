import { User } from './user.entity';
import { Permission } from './permission.entity';
export declare class AdminPermission {
    id: string;
    adminId: string;
    permissionId: string;
    createdAt: Date;
    admin: User;
    permission: Permission;
}
