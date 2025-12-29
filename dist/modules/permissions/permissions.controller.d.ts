import { PermissionsService } from './permissions.service';
export declare class PermissionsController {
    private readonly permissionsService;
    constructor(permissionsService: PermissionsService);
    findAll(): Promise<import("../../entities/permission.entity").Permission[]>;
    getAdminPermissions(adminId: string): Promise<import("../../entities/permission.entity").Permission[]>;
    assignPermission(body: {
        adminId: string;
        permissionId: string;
    }): Promise<import("../../entities/admin-permission.entity").AdminPermission>;
    revokePermission(body: {
        adminId: string;
        permissionId: string;
    }): Promise<{
        message: string;
    }>;
}
