# راه‌حل سریع مشکل JWT 401

## مشکل فعلی
- JWT_SECRET در سرور: `4w8bifq4R5I9KjGPp2uTa2SlARI1pwdXUW3b3ThAJwc=`
- خطای 401 Unauthorized هنگام استفاده از token

## بررسی‌های لازم

### 1. بررسی JWT_SECRET در PM2
PM2 ممکن است environment variables را از `.env` نخواند. بررسی کنید:

```bash
# بررسی environment variables در PM2
pm2 env Ads_server | grep JWT_SECRET
```

اگر خالی بود، باید PM2 را با environment variables راه‌اندازی کنید.

### 2. بررسی JWT_SECRET در runtime
برای اطمینان از اینکه سرور از JWT_SECRET درست استفاده می‌کند:

```bash
# لاگ‌های سرور را ببینید
pm2 logs Ads_server --lines 50

# یا restart کنید و ببینید
pm2 restart Ads_server
```

### 3. راه‌حل: Restart PM2 با Environment Variables

**گزینه A: استفاده از ecosystem file (توصیه می‌شود)**

فایل `ecosystem.config.js` بسازید:

```bash
cd /Ads/Ads_server
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'Ads_server',
    script: './dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 5001,
    },
    env_file: '.env', // این خط مهم است
    watch: false,
    max_memory_restart: '1G',
  }]
};
EOF
```

سپس PM2 را با این فایل راه‌اندازی کنید:

```bash
pm2 delete Ads_server
pm2 start ecosystem.config.js
pm2 save
```

**گزینه B: استفاده از --env-file (PM2 v5.3+)**

```bash
pm2 delete Ads_server
pm2 start dist/main.js --name "Ads_server" --env-file .env -- --port 5001
pm2 save
```

**گزینه C: تنظیم Environment Variables دستی**

```bash
# Export environment variables
export $(cat .env | grep -v '^#' | xargs)

# سپس PM2 را start کنید
pm2 delete Ads_server
pm2 start dist/main.js --name "Ads_server" --update-env -- --port 5001
pm2 save
```

### 4. بررسی نهایی

بعد از restart، بررسی کنید:

```bash
# بررسی JWT_SECRET در PM2
pm2 env Ads_server | grep JWT_SECRET

# باید این مقدار را ببینید:
# JWT_SECRET=4w8bifq4R5I9KjGPp2uTa2SlARI1pwdXUW3b3ThAJwc=
```

### 5. تست Token

اگر token قبلی با JWT_SECRET دیگری ساخته شده، باید دوباره لاگین کنید:

```bash
# تست لاگین
curl -X POST https://apimytodos.appventuregmbh.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@example.com",
    "password": "user123"
  }'
```

Token جدید را بگیرید و دوباره تست کنید.

## به‌روزرسانی Deployment Workflow

برای جلوگیری از این مشکل در آینده، workflow را به‌روز کنید تا از ecosystem file استفاده کند.

