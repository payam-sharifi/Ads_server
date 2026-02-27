# Deployment Notes

## Sharp "Unsupported CPU" Fix (Older Linux Servers)

If you see this error in production:

```
Error: Could not load the "sharp" module using the linux-x64 runtime
Unsupported CPU: Prebuilt binaries for linux-x64 require v2 microarchitecture
```

Your server has an older x86-64 CPU without AVX2. Fix it by installing libvips so sharp builds from source:

### Debian/Ubuntu
```bash
sudo apt-get update
sudo apt-get install -y libvips-dev build-essential
cd /Ads/Ads_server
rm -rf node_modules
npm install
npm run build
pm2 restart Ads_server
```

### Alpine
```bash
apk add --no-cache vips-dev build-base
cd /Ads/Ads_server
rm -rf node_modules
npm install
npm run build
pm2 restart Ads_server
```

### CentOS/RHEL
```bash
sudo yum install -y vips-devel gcc-c++ make
cd /Ads/Ads_server
rm -rf node_modules
npm install
npm run build
pm2 restart Ads_server
```
