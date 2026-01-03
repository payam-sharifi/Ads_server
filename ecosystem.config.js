/**
 * PM2 Ecosystem Configuration
 * 
 * این فایل برای راه‌اندازی اپلیکیشن با PM2 استفاده می‌شود.
 * Environment variables از فایل .env خوانده می‌شوند.
 * 
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 restart ecosystem.config.js
 *   pm2 delete Ads_server
 */

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
    // PM2 will read .env file automatically if dotenv is used in the app
    // But we can also explicitly load it
    env_file: '.env',
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
  }]
};

