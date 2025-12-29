import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../../entities/audit-log.entity';
export interface CreateAuditLogDto {
    action: AuditAction;
    adminId: string;
    entityType?: string;
    entityId?: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    description?: string;
    ipAddress?: string;
}
export declare class AuditLogService {
    private auditLogRepository;
    constructor(auditLogRepository: Repository<AuditLog>);
    log(dto: CreateAuditLogDto): Promise<AuditLog>;
    findAll(filters?: {
        adminId?: string;
        action?: AuditAction;
        entityType?: string;
        entityId?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: AuditLog[];
        total: number;
        page: number;
        limit: number;
    }>;
}
