import { User } from './user.entity';
export declare enum AuditAction {
    USER_CREATED = "user.created",
    USER_UPDATED = "user.updated",
    USER_BLOCKED = "user.blocked",
    USER_UNBLOCKED = "user.unblocked",
    USER_SUSPENDED = "user.suspended",
    AD_APPROVED = "ad.approved",
    AD_REJECTED = "ad.rejected",
    AD_EDITED = "ad.edited",
    AD_DELETED = "ad.deleted",
    PERMISSION_ASSIGNED = "permission.assigned",
    PERMISSION_REVOKED = "permission.revoked",
    ADMIN_CREATED = "admin.created",
    ADMIN_UPDATED = "admin.updated"
}
export declare class AuditLog {
    id: string;
    action: AuditAction;
    adminId: string;
    entityType: string;
    entityId: string;
    oldValues: Record<string, any>;
    newValues: Record<string, any>;
    description: string;
    ipAddress: string;
    createdAt: Date;
    admin: User;
}
