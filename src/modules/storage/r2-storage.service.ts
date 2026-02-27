import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

/**
 * R2 Storage Service
 *
 * Handles read/write operations for Cloudflare R2 using S3-compatible API.
 * Uses environment variables for credentials - never hardcodes keys.
 */
@Injectable()
export class R2StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrlBase: string | null;
  private readonly signedUrlExpirySeconds: number;

  constructor(private readonly configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('CF_R2_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('CF_R2_SECRET_ACCESS_KEY');
    // Default R2 endpoint (override with CF_R2_BUCKET_ENDPOINT for EU: ...eu.r2.cloudflarestorage.com)
    const endpoint =
      this.configService.get<string>('CF_R2_BUCKET_ENDPOINT') ||
      'https://80e79b97d3213471f882433215f46678.r2.cloudflarestorage.com';

    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        'R2 credentials not configured. Set CF_R2_ACCESS_KEY_ID and CF_R2_SECRET_ACCESS_KEY in .env',
      );
    }

    // AWS S3-compatible API expects Access Key ID = 32 characters
    if (accessKeyId.length !== 32) {
      throw new Error(
        `CF_R2_ACCESS_KEY_ID must be 32 characters (got ${accessKeyId.length}). ` +
          'Create a new R2 API token at Cloudflare Dashboard > R2 > Manage R2 API Tokens and copy the Access Key ID exactly.',
      );
    }

    this.bucketName =
      this.configService.get<string>('CF_R2_BUCKET_NAME') || 'classified-ads-images';
    this.publicUrlBase = this.configService.get<string>('CF_R2_PUBLIC_URL') || null;
    this.signedUrlExpirySeconds =
      parseInt(this.configService.get<string>('CF_R2_SIGNED_URL_EXPIRY') || '3600', 10) || 3600;

    this.s3Client = new S3Client({
      region: 'auto', // R2 uses 'auto' for region
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  /**
   * Sanitize filename for safe storage
   * Removes path traversal, special chars, keeps alphanumeric, dash, underscore
   */
  private sanitizeFilename(originalName: string): string {
    const base = originalName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
    return base || 'image';
  }

  /**
   * Generate a unique storage key for an image
   * Always appends .webp since we convert all uploads to WebP via sharp
   */
  private generateKey(originalFilename: string): string {
    const sanitized = this.sanitizeFilename(originalFilename);
    const uniqueId = uuidv4();
    const baseName = sanitized.replace(/\.[^.]+$/, '') || 'image';
    return `images/${uniqueId}-${baseName}.webp`;
  }

  /**
   * Upload a buffer to R2
   * @param buffer - Image buffer (e.g. WebP)
   * @param originalFilename - Original filename for key generation
   * @param contentType - MIME type (e.g. image/webp)
   * @returns Object key and public/signed URL
   */
  async upload(
    buffer: Buffer,
    originalFilename: string,
    contentType: string = 'image/webp',
  ): Promise<{ key: string; url: string }> {
    const key = this.generateKey(originalFilename);

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await this.s3Client.send(command);

    const url = await this.getUrl(key);
    return { key, url };
  }

  /**
   * Build full public URL from key (avoids double slashes)
   */
  buildPublicUrl(key: string): string {
    if (!this.publicUrlBase) return '';
    const base = this.publicUrlBase.trim().replace(/\/+$/, '');
    const path = key.startsWith('/') ? key.slice(1) : key;
    return `${base}/${path}`;
  }

  /**
   * Get URL for an object - public URL if configured, otherwise signed URL
   */
  async getUrl(key: string): Promise<string> {
    if (this.publicUrlBase) {
      return this.buildPublicUrl(key);
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: this.signedUrlExpirySeconds,
    });
  }

  /**
   * Get signed URL for downloading/viewing (for private buckets)
   */
  async getSignedUrl(key: string, expiresIn?: number): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: expiresIn ?? this.signedUrlExpirySeconds,
    });
  }

  /**
   * Download object as buffer
   */
  async download(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const response = await this.s3Client.send(command);
    const body = response.Body;

    if (!body) {
      throw new BadRequestException(`Object not found: ${key}`);
    }

    const chunks: Uint8Array[] = [];
    for await (const chunk of body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }

  /**
   * Delete object from R2
   */
  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }

  /**
   * Check if object exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract R2 key from stored URL (for migration or delete)
   * Handles both public URLs and keys stored directly
   */
  extractKeyFromUrl(url: string): string | null {
    if (url.startsWith('http')) {
      if (this.publicUrlBase && url.startsWith(this.publicUrlBase)) {
        return url.replace(this.publicUrlBase, '').replace(/^\//, '');
      }
      // Try to extract from path like .../images/uuid-name.webp
      const match = url.match(/\/images\/[^/]+$/);
      return match ? match[0].replace(/^\//, '') : null;
    }
    // Assume it's a key if not a full URL
    return url.startsWith('images/') ? url : null;
  }
}
