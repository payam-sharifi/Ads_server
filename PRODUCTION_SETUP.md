# Production Setup Guide

این راهنما برای راه‌اندازی اپلیکیشن در production است.

## مراحل راه‌اندازی

### 1. نصب Dependencies
```bash
npm install
```

### 2. تنظیم Environment Variables
فایل `.env` را با تنظیمات production ایجاد کنید:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=ads_user
DB_PASSWORD=your_password
DB_NAME=classified_ads

JWT_SECRET=your-strong-secret-key
JWT_EXPIRES_IN=7d

PORT=5001
NODE_ENV=production

MAX_FILE_SIZE=5242880
UPLOAD_DEST=./public/uploads

CORS_ORIGIN=https://your-domain.com
```

### 3. ایجاد Migration اولیه (فقط یک بار)
اگر migration اولیه وجود ندارد:
```bash
npm run migration:generate -- -n InitialMigration
```

این دستور یک فایل migration در `src/database/migrations/` ایجاد می‌کند.

### 4. اجرای Migration
```bash
npm run migration:run
```

این دستور تمام migration‌های pending را اجرا می‌کند و جدول‌های دیتابیس را می‌سازد.

### 5. Seed کردن دیتابیس (اختیاری)
```bash
npm run seed
```

این دستور دیتابیس را با داده‌های اولیه پر می‌کند.

### 6. Build کردن اپلیکیشن
```bash
npm run build
```

### 7. اجرای اپلیکیشن
```bash
npm run start:prod
```

## دستورات مفید

- **مشاهده وضعیت Migration‌ها:**
  ```bash
  npm run migration:show
  ```

- **Rollback آخرین Migration:**
  ```bash
  npm run migration:revert
  ```

- **راه‌اندازی کامل (Migration + Seed):**
  ```bash
  npm run setup:prod
  ```

## نکات مهم

1. **هرگز از `synchronize: true` در production استفاده نکنید**
   - در `app.module.ts` این تنظیم به صورت خودکار در production غیرفعال است
   - همیشه از migration استفاده کنید

2. **Migration Files**
   - فایل‌های migration در `src/database/migrations/` ذخیره می‌شوند
   - این فایل‌ها را commit کنید
   - هرگز migration‌های اجرا شده را تغییر ندهید

3. **Backup**
   - قبل از اجرای migration در production، از دیتابیس backup بگیرید

4. **Environment Variables**
   - فایل `.env` را commit نکنید
   - از environment variables سرور استفاده کنید

## Troubleshooting

### خطای "relation does not exist"
اگر این خطا را دیدید، migration‌ها را اجرا کنید:
```bash
npm run migration:run
```

### خطای "migration already executed"
اگر migration قبلاً اجرا شده، می‌توانید وضعیت را بررسی کنید:
```bash
npm run migration:show
```

