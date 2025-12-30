import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';
import { Ad } from '../../entities/ad.entity';
import { Bookmark } from '../../entities/bookmark.entity';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { GuardsModule } from '../guards/guards.module';
import { MessagesModule } from '../messages/messages.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ad, Bookmark]),
    AuditLogModule,
    GuardsModule, // Provides PermissionsGuard and RolesGuard with their dependencies
    forwardRef(() => MessagesModule), // For sending messages when ad is rejected
    PermissionsModule, // For checking admin permissions
  ],
  controllers: [AdsController],
  providers: [AdsService],
  exports: [AdsService],
})
export class AdsModule {}

