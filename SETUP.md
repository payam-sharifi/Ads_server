# Quick Setup Guide

## Step 1: Install Dependencies
```bash
cd backend
npm install
```

## Step 2: Set Up PostgreSQL Database

**Option A: Using Docker (Recommended)**
```bash
docker run --name classified-ads-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=classified_ads \
  -p 5432:5432 \
  -d postgres:15
```

**Option B: Local PostgreSQL Installation**
```bash
# Create database
createdb classified_ads

# Or using psql
psql -U postgres
CREATE DATABASE classified_ads;
\q
```

## Step 3: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` file with your settings:
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

## Step 4: Create Upload Directory
```bash
mkdir -p public/uploads
```

## Step 5: Start the Server
```bash
npm run start:dev
```

The server will automatically create database tables on first run (in development mode).

## Step 6: Seed the Database
In a new terminal:
```bash
npm run seed
```

## Step 7: Access API Documentation
Open your browser: http://localhost:3001/api

## Test the API

### Signup
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+49 123 456789",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Get Categories (Public)
```bash
curl http://localhost:3001/api/categories
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -U postgres -l | grep classified_ads`

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using port 3001:
  ```bash
  lsof -ti:3001 | xargs kill -9
  ```

### Module Not Found Errors
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Update the frontend API configuration to point to `http://localhost:3001/api`
2. Test all endpoints using Swagger UI at http://localhost:3001/api
3. Review the main README.md for detailed API documentation

