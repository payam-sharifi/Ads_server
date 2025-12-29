import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

/**
 * AuditLogService
 * 
 * Handles audit logging for admin actions
 */
@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Create audit log entry
   */
  async log(dto: CreateAuditLogDto): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(dto);
    return this.auditLogRepository.save(auditLog);
  }

  /**
   * Get audit logs with filters
   */
  async findAll(filters?: {
    adminId?: string;
    action?: AuditAction;
    entityType?: string;
    entityId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: AuditLog[]; total: number; page: number; limit: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const query = this.auditLogRepository.createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.admin', 'admin')
      .orderBy('auditLog.createdAt', 'DESC');

    if (filters?.adminId) {
      query.andWhere('auditLog.adminId = :adminId', { adminId: filters.adminId });
    }

    if (filters?.action) {
      query.andWhere('auditLog.action = :action', { action: filters.action });
    }

    if (filters?.entityType) {
      query.andWhere('auditLog.entityType = :entityType', { entityType: filters.entityType });
    }

    if (filters?.entityId) {
      query.andWhere('auditLog.entityId = :entityId', { entityId: filters.entityId });
    }

    const [data, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }
}

