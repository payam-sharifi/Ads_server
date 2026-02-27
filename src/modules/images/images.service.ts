import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../../entities/image.entity';
import { Ad } from '../../entities/ad.entity';
import { R2StorageService } from '../storage/r2-storage.service';
import { ImageProcessorService } from '../storage/image-processor.service';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

/**
 * Images Service
 *
 * Handles image upload and management with Cloudflare R2:
 * - Upload images (compress, convert to WebP, store in R2)
 * - List images for an ad
 * - Delete images from R2
 *
 * Uses R2 for cloud storage. Images are processed with sharp before upload.
 */
@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);
  private readonly useR2: boolean;
  private readonly apiBaseUrl: string;

  constructor(
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>,
    @InjectRepository(Ad)
    private adsRepository: Repository<Ad>,
    private readonly r2Storage: R2StorageService,
    private readonly imageProcessor: ImageProcessorService,
    private readonly configService: ConfigService,
  ) {
    this.useR2 = !!this.configService.get<string>('CF_R2_ACCESS_KEY_ID');
    this.apiBaseUrl =
      this.configService.get<string>('API_BASE_URL') ||
      process.env.API_BASE_URL ||
      'http://localhost:3001';
  }

  /**
   * Extract R2 key from stored value (full URL or legacy key)
   */
  private getR2KeyFromStoredUrl(storedUrl: string): string | null {
    if (!storedUrl) return null;
    if (storedUrl.startsWith('images/')) return storedUrl;
    const key = this.r2Storage.extractKeyFromUrl(storedUrl);
    return key;
  }

  /**
   * Resolve stored url/key to display URL
   * - Full http(s) URL: return as-is
   * - R2 key (images/...): resolve to public or signed URL
   * - Local path (/uploads/...): prepend API base
   */
  private async resolveDisplayUrl(storedUrl: string): Promise<string> {
    if (!storedUrl) return '';

    if (storedUrl.startsWith('http://') || storedUrl.startsWith('https://')) {
      return storedUrl;
    }

    if (storedUrl.startsWith('images/') && this.useR2) {
      return this.r2Storage.getUrl(storedUrl);
    }

    // Local path (legacy)
    const base = this.apiBaseUrl.replace(/\/$/, '');
    const p = storedUrl.startsWith('/') ? storedUrl : `/${storedUrl}`;
    return `${base}${p}`;
  }

  /**
   * Enrich image with resolved URL for API response
   */
  private async enrichWithResolvedUrl(image: Image): Promise<Image & { url: string }> {
    const resolved = await this.resolveDisplayUrl(image.url);
    return { ...image, url: resolved };
  }

  /**
   * Resolve URLs for multiple images (e.g. when returning ads with images)
   */
  async resolveImageUrls(images: Image[]): Promise<(Image & { url: string })[]> {
    if (!images?.length) return [];
    return Promise.all(images.map((img) => this.enrichWithResolvedUrl(img)));
  }

  /**
   * Upload image for an ad
   * Processes with sharp (compress, WebP), uploads to R2, stores metadata.
   *
   * @param file - Uploaded file (buffer from memory storage)
   * @param adId - Ad ID
   * @param order - Display order (optional)
   * @returns Created image entity with resolved URL
   */
  async uploadImage(file: Express.Multer.File, adId: string, order?: number): Promise<Image> {
    const ad = await this.adsRepository.findOne({ where: { id: adId, deletedAt: null } });
    if (!ad) {
      throw new NotFoundException(`Ad with ID ${adId} not found`);
    }

    if (!file?.buffer) {
      throw new BadRequestException('No file or file buffer provided');
    }

    let processedBuffer: Buffer;
    try {
      processedBuffer = await this.imageProcessor.processToWebP(file.buffer);
    } catch (err: any) {
      throw new BadRequestException(err?.message || 'Image processing failed');
    }

    const originalName = file.originalname || 'image';
    let key: string;
    let urlToStore: string;
    try {
      const result = await this.r2Storage.upload(
        processedBuffer,
        originalName,
        'image/webp',
      );
      key = result.key;
      urlToStore = result.url;
    } catch (r2Err: any) {
      const msg = r2Err?.message || 'R2 upload failed';
      const hint =
        msg.includes('bucket does not exist') || r2Err?.name === 'NoSuchBucket'
          ? ` Create the bucket "${this.configService.get('CF_R2_BUCKET_NAME') || 'classified-ads-images'}" in Cloudflare R2 Dashboard, or set CF_R2_BUCKET_NAME to an existing bucket.`
          : '';
      throw new BadRequestException(msg + hint);
    }

    const maxOrder = await this.imagesRepository
      .createQueryBuilder('image')
      .where('image.adId = :adId', { adId })
      .select('MAX(image.order)', 'maxOrder')
      .getRawOne();

    const image = this.imagesRepository.create({
      url: urlToStore,
      fileName: path.basename(originalName, path.extname(originalName)) + '.webp',
      fileSize: processedBuffer.length,
      mimeType: 'image/webp',
      adId,
      order: order ?? (maxOrder?.maxOrder ?? 0) + 1,
    });

    const saved = await this.imagesRepository.save(image);
    return this.enrichWithResolvedUrl(saved);
  }

  /**
   * Get all images for an ad (with resolved URLs)
   */
  async findByAd(adId: string): Promise<(Image & { url: string })[]> {
    const images = await this.imagesRepository.find({
      where: { adId },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
    return Promise.all(images.map((img) => this.enrichWithResolvedUrl(img)));
  }

  /**
   * Get image by ID (with resolved URL)
   */
  async findOne(id: string): Promise<Image & { url: string }> {
    const image = await this.imagesRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return this.enrichWithResolvedUrl(image);
  }

  /**
   * Get signed URL for an image (for private R2 buckets)
   * Useful when frontend needs a fresh URL.
   */
  async getSignedUrl(id: string, expiresIn?: number): Promise<{ url: string }> {
    const image = await this.imagesRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    if (image.url.startsWith('http://') || image.url.startsWith('https://')) {
      return { url: image.url };
    }

    const key = this.getR2KeyFromStoredUrl(image.url);
    if (!key || !this.useR2) {
      return { url: await this.resolveDisplayUrl(image.url) };
    }

    const url = await this.r2Storage.getSignedUrl(key, expiresIn);
    return { url };
  }

  /**
   * Download image as buffer (proxies from R2)
   */
  async downloadBuffer(id: string): Promise<{ buffer: Buffer; contentType: string; fileName: string }> {
    const image = await this.imagesRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    const key = this.getR2KeyFromStoredUrl(image.url);
    if (!key || !this.useR2) {
      throw new BadRequestException('Download is only supported for R2-stored images');
    }

    const buffer = await this.r2Storage.download(key);
    return {
      buffer,
      contentType: image.mimeType || 'image/webp',
      fileName: image.fileName || 'image.webp',
    };
  }

  /**
   * Delete image from R2 and database
   * If the file doesn't exist in R2 (already deleted), still proceeds to remove the DB record
   */
  async remove(id: string): Promise<void> {
    const image = await this.imagesRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    const key = this.getR2KeyFromStoredUrl(image.url);
    if (key && this.useR2) {
      try {
        await this.r2Storage.delete(key);
      } catch (err: any) {
        this.logger.warn(
          `R2 delete failed for key ${key} (image ${id}): ${err?.message || err}. Proceeding with DB removal.`,
        );
        // File may not exist in R2 (NoSuchKey) or other transient error
        // Proceed to remove DB record to keep UI in sync
      }
    }

    await this.imagesRepository.remove(image);
  }

  /**
   * Delete all images for an ad from R2 and database (cascade)
   * Called when an Ad is deleted
   */
  async removeByAdId(adId: string): Promise<void> {
    const images = await this.imagesRepository.find({
      where: { adId },
    });

    for (const image of images) {
      const key = this.getR2KeyFromStoredUrl(image.url);
      if (key && this.useR2) {
        try {
          await this.r2Storage.delete(key);
        } catch {
          // File may not exist in R2; proceed to remove DB record
        }
      }
    }

    await this.imagesRepository.remove(images);
  }
}
