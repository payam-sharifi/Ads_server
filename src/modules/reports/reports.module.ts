import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Report } from '../../entities/report.entity';
import { GuardsModule } from '../guards/guards.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    GuardsModule, // Provides PermissionsGuard and RolesGuard with their dependencies
    AuditLogModule, // For audit logging
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}

