# عیب‌یابی مشکل JWT Token (401 Unauthorized)

## مشکل

اگر هنگام ارسال درخواست‌های API با Bearer token، خطای `401 Unauthorized` دریافت می‌کنید، احتمالاً مشکل از `JWT_SECRET` است.

## علت مشکل

JWT token ها با `JWT_SECRET` امضا می‌شوند و با همان `JWT_SECRET` اعتبارسنجی می‌شوند. اگر `JWT_SECRET` در زمان‌های مختلف متفاوت باشد:

1. **زمان ساخت Token (Login)**: Token با `JWT_SECRET` فعلی سرور امضا می‌شود
2. **زمان اعتبارسنجی Token (API Request)**: Token با `JWT_SECRET` فعلی سرور اعتبارسنجی می‌شود

اگر این دو `JWT_SECRET` متفاوت باشند، اعتبارسنجی با خطا مواجه می‌شود.

## سناریوهای رایج

### 1. تغییر JWT_SECRET بعد از Login
- کاربر با `JWT_SECRET=A` لاگین می‌کند و token دریافت می‌کند
- سرور restart می‌شود با `JWT_SECRET=B`
- Token قبلی دیگر معتبر نیست

### 2. تفاوت JWT_SECRET در محیط‌های مختلف
- Token در development با `JWT_SECRET=dev-secret` ساخته می‌شود
- در production با `JWT_SECRET=prod-secret` اعتبارسنجی می‌شود
- Token معتبر نیست

### 3. Seed Script با JWT_SECRET متفاوت
- Seed script از `JWT_SECRET` خاصی استفاده می‌کند (یا default)
- سرور production از `JWT_SECRET` دیگری استفاده می‌کند
- Token های ساخته شده در seed معتبر نیستند

**نکته**: Seed script خودش token نمی‌سازد، اما اگر کاربران در زمان seed لاگین کرده‌اند، token هایشان با `JWT_SECRET` آن زمان ساخته شده‌اند.

## راه‌حل

### 1. بررسی JWT_SECRET در سرور

```bash
# در سرور production
cd /Ads/Ads_server
cat .env | grep JWT_SECRET
```

یا اگر از environment variables استفاده می‌کنید:
```bash
echo $JWT_SECRET
```

### 2. بررسی JWT_SECRET در کد

کد در سه جا از `JWT_SECRET` استفاده می‌کند:
- `src/modules/auth/auth.module.ts` (خط 14) - برای ساخت token
- `src/strategies/jwt.strategy.ts` (خط 19) - برای اعتبارسنجی token
- `src/guards/jwt-auth.guard.ts` (خط 49) - برای اعتبارسنجی دستی token

همه باید از `process.env.JWT_SECRET` استفاده کنند.

### 3. تنظیم JWT_SECRET یکسان

مطمئن شوید که `JWT_SECRET` در همه جا یکسان است:

```env
# .env file
JWT_SECRET=your-strong-secret-key-here-must-be-same-everywhere
```

### 4. راه‌حل موقت: لاگین مجدد

اگر `JWT_SECRET` تغییر کرده، کاربران باید دوباره لاگین کنند تا token جدید با `JWT_SECRET` جدید دریافت کنند.

### 5. راه‌حل دائمی: استفاده از Environment Variables

در production، از environment variables سرور استفاده کنید:

```bash
# در سرور
export JWT_SECRET=your-strong-secret-key
```

یا در PM2:
```bash
pm2 start dist/main.js --name "Ads_server" --update-env --env production
```

## بررسی Token

برای بررسی اینکه token با چه `JWT_SECRET` ساخته شده، می‌توانید از ابزارهای آنلاین استفاده کنید:

1. https://jwt.io - برای decode کردن token (بدون نیاز به secret)
2. Payload token را ببینید تا `iat` (issued at) را بررسی کنید

## پیشگیری

1. **همیشه از Environment Variables استفاده کنید** - نه hardcode
2. **JWT_SECRET را در Git commit نکنید** - در `.gitignore` قرار دهید
3. **از Secret Management استفاده کنید** - برای production
4. **مستندسازی کنید** - JWT_SECRET را در جایی امن نگه دارید

## مثال خطا

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

این خطا معمولاً به این معنی است:
- Token معتبر نیست (JWT_SECRET متفاوت)
- Token منقضی شده (expired)
- Token format اشتباه است
- User blocked یا suspended است

## دستورات مفید

```bash
# بررسی JWT_SECRET در سرور
cd /Ads/Ads_server
grep JWT_SECRET .env

# Restart سرور با environment variables جدید
pm2 restart Ads_server --update-env

# بررسی لاگ‌های سرور
pm2 logs Ads_server
```

