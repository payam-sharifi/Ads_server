# Cloudflare R2 Image Storage Setup

This guide explains how to configure Cloudflare R2 for image storage in the classified ads backend.

## Prerequisites

- Cloudflare account with R2 enabled
- **R2 bucket created** in Cloudflare dashboard (R2 → Create bucket). The bucket name must match `CF_R2_BUCKET_NAME` in `.env` exactly (e.g. `admin` or `classified-ads-images`).

## Environment Variables

Add these variables to your `.env` file in `Ads_server/`:

```env
# Cloudflare R2 (Required for image uploads)
CF_R2_ACCESS_KEY_ID=your_access_key_id
CF_R2_SECRET_ACCESS_KEY=your_secret_access_key

# R2 Bucket Configuration
CF_R2_BUCKET_NAME=classified-ads-images
CF_R2_BUCKET_ENDPOINT=https://80e79b97d3213471f882433215f46678.r2.cloudflarestorage.com

# Optional: Use EU endpoint instead
# CF_R2_BUCKET_ENDPOINT=https://80e79b97d3213471f882433215f46678.eu.r2.cloudflarestorage.com

# Optional: Public URL (if you've set up a custom domain for your R2 bucket)
# When set, images will be served from this URL instead of signed URLs
# CF_R2_PUBLIC_URL=https://images.yourdomain.com

# Optional: Signed URL expiry in seconds (default: 3600 = 1 hour)
# CF_R2_SIGNED_URL_EXPIRY=3600

# Optional: API base URL for legacy local image paths
# API_BASE_URL=https://api.yourdomain.com
```

## Getting R2 Credentials

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **R2 Object Storage**
3. Create a bucket (e.g. `classified-ads-images`) if you haven't already
4. Go to **Manage R2 API Tokens** → **Create API token**
5. Name it (e.g. "classified-ads") and select **Object Read & Write** permissions
6. Copy **both** values immediately (Secret Access Key cannot be retrieved later):
   - **Access Key ID** – must be exactly **32 characters**
   - **Secret Access Key** – must be exactly **64 characters**
7. Paste them into `.env` as `CF_R2_ACCESS_KEY_ID` and `CF_R2_SECRET_ACCESS_KEY`

**Important:** Do not use Account ID, API Token, or other Cloudflare credentials. Only use the Access Key ID and Secret Access Key from **R2 API Tokens**.

## Bucket Endpoints

- **Default:** `https://80e79b97d3213471f882433215f46678.r2.cloudflarestorage.com`
- **EU:** `https://80e79b97d3213471f882433215f46678.eu.r2.cloudflarestorage.com`

Replace the account ID in the URL with your own from the R2 dashboard.

## Public Access (Optional)

For public image URLs (no signed URLs):

1. In R2 bucket settings, enable **Public access**
2. Add a custom domain (e.g. `images.yourdomain.com`)
3. Set `CF_R2_PUBLIC_URL=https://images.yourdomain.com` in `.env`

## URL Format

When `CF_R2_PUBLIC_URL` is set, the API returns and stores **full public URLs** in the database:
- Format: `{CF_R2_PUBLIC_URL}/images/{uuid}-{name}.webp`
- Example: `https://pub-xxx.r2.dev/images/550e8400-e29b-41d4-a716-446655440000-photo.webp`
- Keys preserve the original file extension (no image processing)

## Image Processing

All uploaded images are:

- **Stored as-is** (no compression or conversion)
- **Converted to WebP** format (75% quality)
- **Resized** if larger than 1920x1920 (maintaining aspect ratio)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/images/:adId` | Upload single image |
| POST | `/api/images/:adId/multiple` | Upload multiple images |
| GET | `/api/images/ad/:adId` | Get all images for an ad |
| GET | `/api/images/:id` | Get image by ID |
| GET | `/api/images/:id/url` | Get signed URL (for private buckets) |
| GET | `/api/images/:id/download` | Download image file |
| DELETE | `/api/images/:id` | Delete image |

## Frontend Configuration

Add your R2 public domain to `Ads_client/next.config.ts` if using a custom domain:

```ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'images.yourdomain.com',
      port: '',
      pathname: '/**',
    },
  ],
},
```

The `**.r2.dev` pattern is already included for Cloudflare's default R2 dev URLs.
