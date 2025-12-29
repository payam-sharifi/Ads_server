import { Repository } from 'typeorm';
import { Report, ReportType, ReportStatus } from '../../entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
export declare class ReportsService {
    private reportRepository;
    constructor(reportRepository: Repository<Report>);
    create(createReportDto: CreateReportDto, reporterId: string): Promise<Report>;
    findAll(filters?: {
        type?: ReportType;
        status?: ReportStatus;
        page?: number;
        limit?: number;
    }): Promise<{
        data: Report[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<Report>;
    updateStatus(id: string, updateDto: UpdateReportStatusDto): Promise<Report>;
    findByReporterId(reporterId: string, filters?: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: Report[];
        total: number;
        page: number;
        limit: number;
    }>;
}
