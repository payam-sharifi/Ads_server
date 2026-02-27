import { Injectable, BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';

/**
 * Image Processor Service
 *
 * Compresses and converts images to WebP format using sharp.
 * Quality: 75 (70-80% as per requirements)
 */
@Injectable()
export class ImageProcessorService {
  private readonly webpQuality = 75;
  private readonly maxWidth = 1920;
  private readonly maxHeight = 1920;

  /**
   * Process image: resize if needed, compress, convert to WebP
   * @param buffer - Raw image buffer (JPEG, PNG, GIF, WebP)
   * @returns Processed WebP buffer
   */
  async processToWebP(buffer: Buffer): Promise<Buffer> {
    try {
      const processed = await sharp(buffer)
        .resize(this.maxWidth, this.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: this.webpQuality })
        .toBuffer();

      return processed;
    } catch (error: any) {
      throw new BadRequestException(
        `Image processing failed: ${error?.message || 'Invalid image'}`,
      );
    }
  }

  /**
   * Get metadata from image buffer
   */
  async getMetadata(buffer: Buffer): Promise<{ width?: number; height?: number; format?: string }> {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      };
    } catch {
      return {};
    }
  }
}
