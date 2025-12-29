import { AdminPermission } from './admin-permission.entity';
export declare class Permission {
    id: string;
    name: string;
    resource: string;
    action: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    adminPermissions: AdminPermission[];
}
