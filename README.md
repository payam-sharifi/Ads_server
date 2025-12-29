# Classified Ads Backend API

REST API backend for the Classified Ads website built with NestJS, TypeORM, and PostgreSQL.

## 🚀 Features

- **Authentication**: JWT-based authentication with role-based access control (user, business, admin)
- **Users**: User registration, login, profile management
- **Categories**: Hierarchical categories with parent-child relationships
- **Ads**: Full CRUD operations with filtering, pagination, and search
- **Images**: Image upload and management for ads
- **Messages**: Messaging system between users about ads
- **Cities**: City management for location-based filtering
- **API Documentation**: Swagger/OpenAPI documentation

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=classified_ads
   
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   PORT=3001
   NODE_ENV=development
   
   MAX_FILE_SIZE=5242880
   UPLOAD_DEST=./public/uploads
   
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Create PostgreSQL database:**
   ```bash
   createdb classified_ads
   ```

## 🗄️ Database Setup

The application uses TypeORM with auto-synchronization in development mode. Simply start the server and the database schema will be created automatically.

Alternatively, you can use migrations:
```bash
npm run migration:generate -- -n InitialMigration
npm run migration:run
```

## 🌱 Seed Database

Populate the database with mock data:

```bash
npm run seed
```

This will create:
- 3 test users (admin, business, normal user)
- 6 categories with subcategories
- 8 cities
- Sample ads with images
- Sample messages

**Test Credentials:**
- Admin: `admin@example.com` / `password123`
- Business: `business@example.com` / `password123`
- User: `user@example.com` / `password123`

## 🏃 Running the Application

**Development mode:**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm run build
npm run start:prod
```

The server will start on `http://localhost:3001`

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3001/api
- Interactive API documentation with request/response examples

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login with email and password

### Users
- `GET /api/users/profile` - Get current user profile (requires auth)
- `PUT /api/users/profile` - Update current user profile (requires auth)

### Categories
- `GET /api/categories` - List all categories (public)
- `GET /api/categories/:id` - Get category by ID (public)
- `POST /api/categories` - Create category (admin only)
- `PATCH /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

### Cities
- `GET /api/cities` - List all cities (public)
- `GET /api/cities/:id` - Get city by ID (public)
- `POST /api/cities` - Create city (admin only)

### Ads
- `GET /api/ads` - List ads with filters and pagination (public)
  - Query params: `categoryId`, `subcategoryId`, `cityId`, `minPrice`, `maxPrice`, `status`, `search`, `page`, `limit`, `sortBy`, `sortOrder`
- `GET /api/ads/:id` - Get ad by ID (public)
- `GET /api/ads/user/my` - Get current user's ads (requires auth)
- `POST /api/ads` - Create new ad (requires auth)
- `PATCH /api/ads/:id` - Update ad (owner or admin)
- `DELETE /api/ads/:id` - Delete ad (owner or admin)

### Images
- `POST /api/images/:adId` - Upload image for an ad (requires auth, owner only)
- `GET /api/images/ad/:adId` - Get all images for an ad (public)
- `GET /api/images/:id` - Get image by ID (public)
- `DELETE /api/images/:id` - Delete image (requires auth, owner or admin)

### Messages
- `POST /api/messages` - Send a message about an ad (requires auth)
- `GET /api/messages/ad/:adId` - Get all messages for an ad (requires auth)
- `GET /api/messages/:id` - Get message by ID (requires auth)
- `GET /api/messages/inbox/my` - Get current user's inbox (requires auth)
- `PATCH /api/messages/:id/read` - Mark message as read (requires auth)

## 🔐 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

You receive the token after successful login or signup:
```json
{
  "user": { ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 👥 User Roles

- **user**: Normal user (default)
- **business**: Business account
- **admin**: Administrator with full access

## 📝 Example Requests

### Signup
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+49 123 456789",
    "password": "securePassword123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

### Create Ad (with authentication)
```bash
curl -X POST http://localhost:3001/api/ads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "BMW 320d",
    "description": "Great condition car",
    "price": 25000,
    "categoryId": "uuid",
    "cityId": "uuid",
    "status": "active"
  }'
```

### Filter Ads
```bash
curl "http://localhost:3001/api/ads?categoryId=uuid&minPrice=1000&maxPrice=50000&status=active&page=1&limit=20"
```

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── entities/          # TypeORM entities
│   ├── modules/           # Feature modules
│   │   ├── auth/          # Authentication
│   │   ├── users/         # User management
│   │   ├── categories/    # Categories
│   │   ├── cities/        # Cities
│   │   ├── ads/           # Advertisements
│   │   ├── images/        # Image uploads
│   │   └── messages/      # Messaging
│   ├── guards/            # Auth guards
│   ├── decorators/        # Custom decorators
│   ├── strategies/        # Passport strategies
│   ├── database/
│   │   └── seeds/         # Database seed script
│   ├── app.module.ts      # Root module
│   └── main.ts            # Application entry point
├── public/
│   └── uploads/           # Uploaded images
└── package.json
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🔧 Configuration

### File Upload
- Max file size: 5MB (configurable via `MAX_FILE_SIZE` env variable)
- Supported formats: jpg, jpeg, png, gif, webp
- Upload directory: `./public/uploads` (configurable via `UPLOAD_DEST`)

### CORS
Configure allowed origins in `.env`:
```env
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Deployment

1. Set `NODE_ENV=production` in your environment
2. Update database credentials
3. Set a strong `JWT_SECRET`
4. Build the application: `npm run build`
5. Run migrations: `npm run migration:run`
6. Start the server: `npm run start:prod`

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

