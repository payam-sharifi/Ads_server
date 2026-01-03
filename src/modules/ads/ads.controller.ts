import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdsService } from './ads.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { FilterAdsDto } from './dto/filter-ads.dto';
import { ApproveAdDto } from './dto/approve-ad.dto';
import { RejectAdDto } from './dto/reject-ad.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Permissions } from '../../decorators/permissions.decorator';
import { RoleType } from '../../entities/role.entity';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { User } from '../../entities/user.entity';
import { Public } from '../../decorators/public.decorator';

/**
 * Ads Controller
 * 
 * Endpoints:
 * - GET /api/ads - List ads with filters and pagination (public)
 * - GET /api/ads/:id - Get ad by ID (public)
 * - POST /api/ads - Create new ad (requires auth)
 * - PATCH /api/ads/:id - Update ad (owner or admin)
 * - DELETE /api/ads/:id - Delete ad (owner or admin)
 * - GET /api/ads/user/my - Get current user's ads (requires auth)
 */
@ApiTags('Ads')
@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  /**
   * Get all ads with filtering and pagination
   * 
   * Request:
   *   GET /api/ads?categoryId=uuid&cityId=uuid&minPrice=1000&maxPrice=50000&status=active&page=1&limit=20&search=BMW
   * 
   * Response:
   *   {
   *     "data": [Array of ads],
   *     "pagination": {
   *       "total": 100,
   *       "page": 1,
   *       "limit": 20,
   *       "totalPages": 5
   *     }
   *   }
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @Public()
  @ApiOperation({ summary: 'Get all ads with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Ads retrieved successfully' })
  findAll(@Query() filters: FilterAdsDto, @CurrentUser() user?: User) {
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/fe4c5ec4-2787-4be7-9054-016ec7118181',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ads.controller.ts:69',message:'GET /ads route handler called',data:{filters,hasUser:!!user,userId:user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return this.adsService.findAll(filters, user);
  }

  /**
   * Get user's bookmarked ads
   * IMPORTANT: This route must come BEFORE ':id' to avoid route matching conflicts
   */
  @Get('bookmarked')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Get current user's bookmarked ads" })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Bookmarked ads retrieved successfully' })
  getBookmarkedAds(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: User,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.adsService.getBookmarkedAds(user.id, pageNum, limitNum);
  }

  /**
   * Get ad by ID
   * Automatically increments view count
   * Public endpoint but uses JwtAuthGuard to extract user if token is provided
   * This allows admins to see all ads (including pending/rejected) when authenticated
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Public()
  @ApiOperation({ summary: 'Get ad by ID' })
  @ApiResponse({ status: 200, description: 'Ad retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Ad not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: User) {
    return this.adsService.findOne(id, true, user);
  }

  /**
   * Get current user's ads
   * IMPORTANT: This route must come BEFORE 'user/:userId' to avoid route matching conflicts
   */
  @Get('user/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Get current user's ads" })
  @ApiResponse({ status: 200, description: 'User ads retrieved successfully' })
  findMyAds(@CurrentUser() user: User) {
    return this.adsService.findByUser(user.id, user);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Get user's ads (own ads or admin)" })
  @ApiResponse({ status: 200, description: 'User ads retrieved successfully' })
  findUserAds(@Param('userId', ParseUUIDPipe) userId: string, @CurrentUser() user: User) {
    return this.adsService.findByUser(userId, user);
  }

  /**
   * Approve ad (Admin/Super Admin with ads.approve permission)
   */
  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @Permissions('ads.approve')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Approve ad (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Ad approved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  approve(@Param('id', ParseUUIDPipe) id: string, @Body() approveAdDto: ApproveAdDto, @CurrentUser() user: User) {
    return this.adsService.approve(id, approveAdDto, user);
  }

  /**
   * Reject ad (Admin/Super Admin with ads.reject permission)
   */
  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @Permissions('ads.reject')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reject ad (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Ad rejected successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  reject(@Param('id', ParseUUIDPipe) id: string, @Body() rejectAdDto: RejectAdDto, @CurrentUser() user: User) {
    return this.adsService.reject(id, rejectAdDto, user);
  }

  /**
   * Create a new ad
   * 
   * Request:
   *   POST /api/ads
   *   Headers: { Authorization: "Bearer <token>" }
   *   Body: { title, description, price, categoryId, cityId, ... }
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new ad' })
  @ApiResponse({ status: 201, description: 'Ad created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createAdDto: CreateAdDto, @CurrentUser() user: User) {
    return this.adsService.create(createAdDto, user.id);
  }

  /**
   * Update ad
   * Only owner or admin can update
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update ad (owner or admin only)' })
  @ApiResponse({ status: 200, description: 'Ad updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateAdDto: UpdateAdDto, @CurrentUser() user: User) {
    return this.adsService.update(id, updateAdDto, user);
  }

  /**
   * Suspend ad (Admin/Super Admin only)
   */
  @Post(':id/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @Permissions('ads.edit')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Suspend ad (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Ad suspended successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  suspend(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.adsService.suspend(id, user);
  }

  /**
   * Unsuspend ad (Admin/Super Admin only)
   */
  @Post(':id/unsuspend')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @Permissions('ads.edit')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Unsuspend ad (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Ad unsuspended successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  unsuspend(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.adsService.unsuspend(id, user);
  }

  /**
   * Delete ad
   * Only owner or admin with ads.delete permission can delete
   * Note: Permission check is done in service to allow owners to delete their own ads
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete ad (owner or admin with ads.delete permission)' })
  @ApiResponse({ status: 200, description: 'Ad deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.adsService.remove(id, user);
  }

  /**
   * Bookmark an ad
   */
  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Bookmark an ad' })
  @ApiResponse({ status: 201, description: 'Ad bookmarked successfully' })
  @ApiResponse({ status: 404, description: 'Ad not found' })
  bookmark(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.adsService.bookmarkAd(id, user.id);
  }

  /**
   * Remove bookmark from an ad
   */
  @Delete(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Remove bookmark from an ad' })
  @ApiResponse({ status: 200, description: 'Bookmark removed successfully' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  unbookmark(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.adsService.unbookmarkAd(id, user.id);
  }

}

