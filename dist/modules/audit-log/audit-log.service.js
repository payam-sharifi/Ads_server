"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("../../entities/audit-log.entity");
let AuditLogService = class AuditLogService {
    constructor(auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }
    async log(dto) {
        const auditLog = this.auditLogRepository.create(dto);
        return this.auditLogRepository.save(auditLog);
    }
    async findAll(filters) {
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
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map