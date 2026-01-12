import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { User } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Ad } from '../entities/ad.entity';
import { Image } from '../entities/image.entity';
import { Message } from '../entities/message.entity';
import { City } from '../entities/city.entity';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { AdminPermission } from '../entities/admin-permission.entity';
import { Report } from '../entities/report.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { Bookmark } from '../entities/bookmark.entity';
import { EmailVerification } from '../entities/email-verification.entity';

// Load environment variables
dotenv.config();

export default new DataSource({
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
    EmailVerification,
  ],
  migrations: [
    process.env.NODE_ENV === 'production' 
      ? resolve(process.cwd(), 'dist/src/database/migrations/*.js')
      : resolve(process.cwd(), 'src/database/migrations/*.ts')
  ],
  synchronize: false, // Never use synchronize in production
  logging: process.env.NODE_ENV === 'development',
});

