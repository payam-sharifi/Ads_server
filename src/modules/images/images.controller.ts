import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ImagesService } from './images.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { RoleType } from '../../entities/role.entity';
import { AdsService } from '../ads/ads.service';
import { Public } from '../../decorators/public.decorator';
import { diskStorage } from 'multer';
import { extname } from 'path';

/**
 * Images Controller
 * 
 * Endpoints:
 * - POST /api/images/:adId - Upload image for an ad (requires auth, owner only)
 * - GET /api/images/ad/:adId - Get all images for an ad (public)
 * - GET /api/images/:id - Get image by ID (public)
 * - DELETE /api/images/:id - Delete image (requires auth, owner or admin)
 * 
 * File uploads:
 * - Supported formats: jpg, jpeg, png, gif, webp
 * - Max file size: 5MB (configurable)
 */
@ApiTags('Images')
@Controller('images')
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly adsService: AdsService,
  ) {}

  /**
   * Upload image for an ad
   * 
   * Request:
   *   POST /api/images/:adId
   *   Headers: { Authorization: "Bearer <token>", Content-Type: "multipart/form-data" }
   *   Body: FormData with 'file' field
   *   Query: ?order=1 (optional, for image ordering)
   * 
   * Response: Image object with URL
   */
  @Post(':adId')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DEST || './public/uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid file type. Only images are allowed.'), false);
        }
      },
    }),
  )
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
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
    @Query('order') order: number,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Verify user owns the ad
    // Pass user to findOne so it can check ownership for PENDING_APPROVAL ads
    const ad = await this.adsService.findOne(adId, false, user);
    if (ad.userId !== user.id && user.role?.name !== RoleType.ADMIN && user.role?.name !== RoleType.SUPER_ADMIN) {
      throw new BadRequestException('You can only upload images for your own ads');
    }

    return this.imagesService.uploadImage(file, adId, order ? parseInt(order.toString()) : undefined);
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

    // Check permissions
    if (ad.userId !== user.id && user.role?.name !== RoleType.ADMIN && user.role?.name !== RoleType.SUPER_ADMIN) {
      throw new BadRequestException('You can only delete images from your own ads');
    }

    return this.imagesService.remove(id);
  }
}

