import { ReportType } from '../../../entities/report.entity';
export declare class CreateReportDto {
    type: ReportType;
    adId?: string;
    messageId?: string;
    reason: string;
}
