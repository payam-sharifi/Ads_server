import { Global, Module, forwardRef } from '@nestjs/common';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { PermissionsModule } from '../permissions/permissions.module';
import { UsersModule } from '../users/users.module';

/**
 * Guards Module
 * 
 * Provides guards with their dependencies
 * Made global so guards can be used across all modules
 */
@Global()
@Module({
  imports: [PermissionsModule, forwardRef(() => UsersModule)],
  providers: [PermissionsGuard, RolesGuard, JwtAuthGuard],
  exports: [PermissionsGuard, RolesGuard, JwtAuthGuard, PermissionsModule],
})
export class GuardsModule {}

