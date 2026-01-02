import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { AdsModule } from './modules/ads/ads.module';
import { ImagesModule } from './modules/images/images.module';
import { MessagesModule } from './modules/messages/messages.module';
import { CitiesModule } from './modules/cities/cities.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { GuardsModule } from './modules/guards/guards.module';

import { User } from './entities/user.entity';
import { Category } from './entities/category.entity';
import { Ad } from './entities/ad.entity';
import { Image } from './entities/image.entity';
import { Message } from './entities/message.entity';
import { City } from './entities/city.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { AdminPermission } from './entities/admin-permission.entity';
import { Report } from './entities/report.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Bookmark } from './entities/bookmark.entity';

/**
 * Main application module
 * 
 * Imports all feature modules and configures:
 * - Environment variables (ConfigModule)
 * - Database connection (TypeOrmModule)
 * - Static file serving for uploaded images
 */
@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database configuration with TypeORM
    // Supports PostgreSQL, but can be easily switched to MySQL or MongoDB
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'classified_ads',
      entities: [
        User,
        Category,
        Ad,
        Image,
        Message,
        City,
        Role,
        Permission,
        AdminPermission,
        Report,
        AuditLog,
        Bookmark,
      ],
      migrations: [
        process.env.NODE_ENV === 'production'
          ? 'dist/database/migrations/*.js'
          : 'src/database/migrations/*.ts'
      ],
      synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in dev mode
      logging: process.env.NODE_ENV === 'development',
    }),

    // Serve static files (uploaded images)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public', 'uploads'),
      serveRoot: '/uploads',
    }),

    // Feature modules
    GuardsModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    AdsModule,
    ImagesModule,
    MessagesModule,
    CitiesModule,
    PermissionsModule,
    ReportsModule,
    AuditLogModule,
  ],
})
export class AppModule {}

