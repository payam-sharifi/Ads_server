import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../../entities/image.entity';
import { Ad } from '../../entities/ad.entity';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Images Service
 * 
 * Handles image upload and management:
 * - Upload images for ads
 * - List images for an ad
 * - Delete images
 * 
 * Supports local file storage. Can be easily extended to use S3, Cloudinary, etc.
 */
@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>,
    @InjectRepository(Ad)
    private adsRepository: Repository<Ad>,
  ) {}

  /**
   * Upload image for an ad
   * 
   * @param file - Uploaded file (already saved to disk by multer)
   * @param adId - Ad ID
   * @param order - Display order (optional)
   * @returns Created image entity
   */
  async uploadImage(file: Express.Multer.File, adId: string, order?: number): Promise<Image> {
    // Verify ad exists
    const ad = await this.adsRepository.findOne({ where: { id: adId, deletedAt: null } });
    if (!ad) {
      throw new NotFoundException(`Ad with ID ${adId} not found`);
    }

    // File is already saved by multer, get the filename from the file object
    const fileName = file.filename;
    const fileUrl = `/uploads/${fileName}`;

    // Get current max order for this ad
    const maxOrder = await this.imagesRepository
      .createQueryBuilder('image')
      .where('image.adId = :adId', { adId })
      .select('MAX(image.order)', 'maxOrder')
      .getRawOne();

    // Create image entity
    const image = this.imagesRepository.create({
      url: fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      adId,
      order: order ?? (maxOrder?.maxOrder ?? 0) + 1,
    });

    return this.imagesRepository.save(image);
  }

  /**
   * Get all images for an ad
   */
  async findByAd(adId: string): Promise<Image[]> {
    return this.imagesRepository.find({
      where: { adId },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  /**
   * Get image by ID
   */
  async findOne(id: string): Promise<Image> {
    const image = await this.imagesRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return image;
  }

  /**
   * Delete image
   * Removes file from filesystem and database record
   */
  async remove(id: string): Promise<void> {
    const image = await this.findOne(id);
    const filePath = path.join(process.env.UPLOAD_DEST || './public/uploads', path.basename(image.url));

    // Delete file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete database record
    await this.imagesRepository.remove(image);
  }
}

