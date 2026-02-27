import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseUUIDPipe,
  Query,
  BadRequestException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { memoryStorage } from 'multer';
import { ImagesService } from './images.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { RoleType } from '../../entities/role.entity';
import { AdsService } from '../ads/ads.service';
import { Public } from '../../decorators/public.decorator';

const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10) || 5 * 1024 * 1024; // 5MB

/**
 * Images Controller
 *
 * Endpoints:
 * - POST /api/images/:adId - Upload image(s) for an ad (requires auth, owner only)
 * - GET /api/images/ad/:adId - Get all images for an ad (public)
 * - GET /api/images/:id - Get image by ID (public)
 * - GET /api/images/:id/url - Get signed URL for image (public, for private R2)
 * - GET /api/images/:id/download - Download image (public)
 * - DELETE /api/images/:id - Delete image (requires auth, owner or admin)
 *
 * Images are compressed and converted to WebP before upload to R2.
 */
@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly adsService: AdsService,
  ) {}

  /**
   * Upload single image for an ad
   */
  @Post(':adId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: MAX_FILE_SIZE }, fileFilter: (_, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) cb(null, true);
    else cb(new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, WebP are allowed.'), false);
  } }))
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload image for an ad (owner only)' })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (not ad owner)' })
  async uploadImage(
    @Param('adId', ParseUUIDPipe) adId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('order') order: string | number,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const ad = await this.adsService.findOne(adId, false, user);
    if (ad.userId !== user.id && user.role?.name !== RoleType.ADMIN && user.role?.name !== RoleType.SUPER_ADMIN) {
      throw new BadRequestException('You can only upload images for your own ads');
    }

    return this.imagesService.uploadImage(
      file,
      adId,
      order != null ? parseInt(String(order), 10) : undefined,
    );
  }

  /**
   * Upload multiple images for an ad
   */
  @Post(':adId/multiple')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_, file, cb) => {
        if (ALLOWED_MIMES.includes(file.mimetype)) cb(null, true);
        else cb(new BadRequestException('Invalid file type. Only JPEG, PNG, GIF, WebP are allowed.'), false);
      },
    }),
  )
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @ApiOperation({ summary: 'Upload multiple images for an ad (owner only)' })
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  async uploadMultipleImages(
    @Param('adId', ParseUUIDPipe) adId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: User,
  ) {
    if (!files?.length) {
      throw new BadRequestException('No files provided');
    }

    const ad = await this.adsService.findOne(adId, false, user);
    if (ad.userId !== user.id && user.role?.name !== RoleType.ADMIN && user.role?.name !== RoleType.SUPER_ADMIN) {
      throw new BadRequestException('You can only upload images for your own ads');
    }

    const results = [];
    for (let i = 0; i < files.length; i++) {
      const img = await this.imagesService.uploadImage(files[i], adId, i + 1);
      results.push(img);
    }
    return results;
  }

  /**
   * Get all images for an ad
   */
  @Get('ad/:adId')
  @Public()
  @ApiOperation({ summary: 'Get all images for an ad' })
  @ApiResponse({ status: 200, description: 'Images retrieved successfully' })
  findByAd(@Param('adId', ParseUUIDPipe) adId: string) {
    return this.imagesService.findByAd(adId);
  }

  /**
   * Get image by ID
   */
  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get image by ID' })
  @ApiResponse({ status: 200, description: 'Image retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.imagesService.findOne(id);
  }

  /**
   * Get signed URL for image (for private R2 buckets)
   */
  @Get(':id/url')
  @Public()
  @ApiOperation({ summary: 'Get signed URL for image' })
  @ApiResponse({ status: 200, description: 'Signed URL retrieved' })
  async getSignedUrl(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('expiresIn') expiresIn?: string,
  ) {
    const sec = expiresIn ? parseInt(expiresIn, 10) : undefined;
    return this.imagesService.getSignedUrl(id, sec);
  }

  /**
   * Download image (streams from R2)
   */
  @Get(':id/download')
  @Public()
  @ApiOperation({ summary: 'Download image' })
  @ApiResponse({ status: 200, description: 'Image file' })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { buffer, contentType, fileName } = await this.imagesService.downloadBuffer(id);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Cache-Control': 'public, max-age=86400',
    });
    return new StreamableFile(buffer);
  }

  /**
   * Delete image
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete image (owner or admin only)' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    const image = await this.imagesService.findOne(id);
    const ad = await this.adsService.findOne(image.adId, false);

    if (ad.userId !== user.id && user.role?.name !== RoleType.ADMIN && user.role?.name !== RoleType.SUPER_ADMIN) {
      throw new BadRequestException('You can only delete images from your own ads');
    }

    await this.imagesService.remove(id);
    return { success: true };
  }
}
