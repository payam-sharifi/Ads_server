import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { User } from '../../entities/user.entity';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    create(createReportDto: CreateReportDto, user: User): Promise<import("../../entities/report.entity").Report>;
    findAll(filters: any): Promise<{
        data: import("../../entities/report.entity").Report[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByReporterId(userId: string, page?: number, limit?: number): Promise<{
        data: import("../../entities/report.entity").Report[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<import("../../entities/report.entity").Report>;
    updateStatus(id: string, updateDto: UpdateReportStatusDto): Promise<import("../../entities/report.entity").Report>;
}
