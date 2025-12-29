"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const categories_module_1 = require("./modules/categories/categories.module");
const ads_module_1 = require("./modules/ads/ads.module");
const images_module_1 = require("./modules/images/images.module");
const messages_module_1 = require("./modules/messages/messages.module");
const cities_module_1 = require("./modules/cities/cities.module");
const permissions_module_1 = require("./modules/permissions/permissions.module");
const reports_module_1 = require("./modules/reports/reports.module");
const audit_log_module_1 = require("./modules/audit-log/audit-log.module");
const guards_module_1 = require("./modules/guards/guards.module");
const user_entity_1 = require("./entities/user.entity");
const category_entity_1 = require("./entities/category.entity");
const ad_entity_1 = require("./entities/ad.entity");
const image_entity_1 = require("./entities/image.entity");
const message_entity_1 = require("./entities/message.entity");
const city_entity_1 = require("./entities/city.entity");
const role_entity_1 = require("./entities/role.entity");
const permission_entity_1 = require("./entities/permission.entity");
const admin_permission_entity_1 = require("./entities/admin-permission.entity");
const report_entity_1 = require("./entities/report.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
                username: process.env.DB_USERNAME || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres',
                database: process.env.DB_NAME || 'classified_ads',
                entities: [
                    user_entity_1.User,
                    category_entity_1.Category,
                    ad_entity_1.Ad,
                    image_entity_1.Image,
                    message_entity_1.Message,
                    city_entity_1.City,
                    role_entity_1.Role,
                    permission_entity_1.Permission,
                    admin_permission_entity_1.AdminPermission,
                    report_entity_1.Report,
                    audit_log_entity_1.AuditLog,
                ],
                synchronize: process.env.NODE_ENV !== 'production',
                logging: process.env.NODE_ENV === 'development',
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'public', 'uploads'),
                serveRoot: '/uploads',
            }),
            guards_module_1.GuardsModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            categories_module_1.CategoriesModule,
            ads_module_1.AdsModule,
            images_module_1.ImagesModule,
            messages_module_1.MessagesModule,
            cities_module_1.CitiesModule,
            permissions_module_1.PermissionsModule,
            reports_module_1.ReportsModule,
            audit_log_module_1.AuditLogModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map