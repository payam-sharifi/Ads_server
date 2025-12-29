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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const report_entity_1 = require("../../entities/report.entity");
let ReportsService = class ReportsService {
    constructor(reportRepository) {
        this.reportRepository = reportRepository;
    }
    async create(createReportDto, reporterId) {
        const report = this.reportRepository.create({
            ...createReportDto,
            reporterId,
        });
        return this.reportRepository.save(report);
    }
    async findAll(filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;
        const query = this.reportRepository.createQueryBuilder('report')
            .leftJoinAndSelect('report.reporter', 'reporter')
            .leftJoinAndSelect('report.ad', 'ad')
            .leftJoinAndSelect('report.message', 'message')
            .orderBy('report.createdAt', 'DESC');
        if (filters?.type) {
            query.andWhere('report.type = :type', { type: filters.type });
        }
        if (filters?.status) {
            query.andWhere('report.status = :status', { status: filters.status });
        }
        const [data, total] = await query
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return { data, total, page, limit };
    }
    async findOne(id) {
        const report = await this.reportRepository.findOne({
            where: { id },
            relations: ['reporter', 'ad', 'message'],
        });
        if (!report) {
            throw new common_1.NotFoundException(`Report with ID ${id} not found`);
        }
        return report;
    }
    async updateStatus(id, updateDto) {
        const report = await this.findOne(id);
        report.status = updateDto.status;
        if (updateDto.adminNotes) {
            report.adminNotes = updateDto.adminNotes;
        }
        return this.reportRepository.save(report);
    }
    async findByReporterId(reporterId, filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;
        const query = this.reportRepository
            .createQueryBuilder('report')
            .leftJoinAndSelect('report.reporter', 'reporter')
            .leftJoinAndSelect('report.ad', 'ad')
            .leftJoinAndSelect('report.message', 'message')
            .where('report.reporterId = :reporterId', { reporterId })
            .orderBy('report.createdAt', 'DESC');
        const [data, total] = await query.skip(skip).take(limit).getManyAndCount();
        return { data, total, page, limit };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(report_entity_1.Report)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map