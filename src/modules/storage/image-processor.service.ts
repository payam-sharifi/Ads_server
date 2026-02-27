import { Injectable, BadRequestException } from '@nestjs/common';
import { createJimp } from '@jimp/core';
import { defaultFormats, defaultPlugins } from 'jimp';
import webp from '@jimp/wasm-webp';

/**
 * Custom Jimp instance with WebP support (pure JS/WASM, no native binaries)
 */
const Jimp = createJimp({
  formats: [...defaultFormats, webp],
  plugins: defaultPlugins,
});

/**
 * Image Processor Service
 *
 * Compresses and converts images to WebP format using Jimp.
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
      const image = await Jimp.read(buffer);

      // Resize to fit inside max dimensions (without enlarging)
      if (image.width > this.maxWidth || image.height > this.maxHeight) {
        image.contain({ w: this.maxWidth, h: this.maxHeight });
      }

      const processed = await image.getBuffer('image/webp', {
        quality: this.webpQuality,
      });
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
      const image = await Jimp.read(buffer);
      return {
        width: image.width,
        height: image.height,
        format: image.mime || undefined,
      };
    } catch {
      return {};
    }
  }
}
