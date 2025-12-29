"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const fs = require("fs");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Classified Ads API')
        .setDescription('REST API for Classified Ads Website. Provides endpoints for users, categories, ads, images, and messages.')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addTag('Auth', 'Authentication endpoints (signup, login, refresh)')
        .addTag('Users', 'User management endpoints')
        .addTag('Categories', 'Category management endpoints')
        .addTag('Ads', 'Advertisements CRUD operations and approval workflow')
        .addTag('Images', 'Image upload and management')
        .addTag('Messages', 'Messaging between users')
        .addTag('Cities', 'City management endpoints')
        .addTag('Permissions', 'Permission management (Super Admin only)')
        .addTag('Reports', 'Report management (Admin/Super Admin)')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const uploadDir = process.env.UPLOAD_DEST || './public/uploads';
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 Server is running on: http://localhost:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map