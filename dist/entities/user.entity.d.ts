import { Ad } from './ad.entity';
import { Message } from './message.entity';
import { Role } from './role.entity';
import { AdminPermission } from './admin-permission.entity';
import { Report } from './report.entity';
import { AuditLog } from './audit-log.entity';
export declare class User {
    id: string;
    name: string;
    email: string;
    phone: string;
    password: string;
    roleId: string;
    isBlocked: boolean;
    isSuspended: boolean;
    suspendedUntil: Date;
    refreshToken: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    role: Role;
    ads: Ad[];
    sentMessages: Message[];
    receivedMessages: Message[];
    adminPermissions: AdminPermission[];
    reports: Report[];
    auditLogs: AuditLog[];
}
