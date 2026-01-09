import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as fs from 'fs';

/**
 * Bootstrap function to start the NestJS application
 * 
 * API Documentation will be available at: http://localhost:3001/api
 * 
 * Example API endpoints:
 * - POST /api/auth/signup - Register a new user
 *   Body: { name: string, email: string, phone: string, password: string, role?: 'user' | 'business' | 'admin' }
 *   Response: { user: User, accessToken: string }
 * 
 * - POST /api/auth/login - Login user
 *   Body: { email: string, password: string }
 *   Response: { user: User, accessToken: string }
 * 
 * - GET /api/users/profile - Get current user profile (requires auth)
 *   Headers: { Authorization: 'Bearer <token>' }
 *   Response: { id, name, email, phone, role, createdAt }
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 
  //Enable CORS for frontend
 app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Classified Ads API')
    .setDescription(
      'REST API for Classified Ads Website. Provides endpoints for users, categories, ads, images, and messages.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Ensure upload directory exists
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

