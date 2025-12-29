import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { Permission } from '../../entities/permission.entity';
import { AdminPermission } from '../../entities/admin-permission.entity';
import { User } from '../../entities/user.entity';

/**
 * Permissions Module
 * 
 * Made global so PermissionsService can be used by guards across all modules
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Permission, AdminPermission, User])],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}

