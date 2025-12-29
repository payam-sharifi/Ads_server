import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportType, ReportStatus } from '../../entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';

/**
 * Reports Service
 * 
 * Handles report management:
 * - Create reports (users)
 * - View reports (admins)
 * - Update report status (admins)
 */
@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
  ) {}

  /**
   * Create a new report
   */
  async create(createReportDto: CreateReportDto, reporterId: string): Promise<Report> {
    const report = this.reportRepository.create({
      ...createReportDto,
      reporterId,
    });

    return this.reportRepository.save(report);
  }

  /**
   * Get all reports with filters (Admin/Super Admin)
   */
  async findAll(filters?: {
    type?: ReportType;
    status?: ReportStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: Report[]; total: number; page: number; limit: number }> {
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

  /**
   * Get report by ID
   */
  async findOne(id: string): Promise<Report> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['reporter', 'ad', 'message'],
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  /**
   * Update report status (Admin/Super Admin)
   */
  async updateStatus(id: string, updateDto: UpdateReportStatusDto): Promise<Report> {
    const report = await this.findOne(id);

    report.status = updateDto.status;
    if (updateDto.adminNotes) {
      report.adminNotes = updateDto.adminNotes;
    }

    return this.reportRepository.save(report);
  }

  /**
   * Get reports by reporter ID (Super Admin only)
   */
  async findByReporterId(
    reporterId: string,
    filters?: {
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: Report[]; total: number; page: number; limit: number }> {
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
}

