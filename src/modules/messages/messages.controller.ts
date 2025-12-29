import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Permissions } from '../../decorators/permissions.decorator';
import { RoleType } from '../../entities/role.entity';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

/**
 * Messages Controller
 * 
 * Endpoints:
 * - POST /api/messages - Send a message about an ad (requires auth)
 * - GET /api/messages/ad/:adId - Get all messages for an ad (requires auth)
 * - GET /api/messages/:id - Get message by ID (requires auth)
 * - GET /api/messages/inbox/my - Get current user's inbox (requires auth)
 * - PATCH /api/messages/:id/read - Mark message as read (requires auth)
 */
@ApiTags('Messages')
@ApiBearerAuth('JWT-auth')
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  /**
   * Send a message about an ad
   * 
   * Request:
   *   POST /api/messages
   *   Headers: { Authorization: "Bearer <token>" }
   *   Body: {
   *     "adId": "uuid",
   *     "messageText": "Is this item still available?"
   *   }
   * 
   * Response: Created message object
   */
  @Post()
  @ApiOperation({ summary: 'Send a message about an ad' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Cannot send message to yourself' })
  @ApiResponse({ status: 404, description: 'Ad not found' })
  create(@Body() createMessageDto: CreateMessageDto, @CurrentUser() user: User) {
    return this.messagesService.create(createMessageDto, user.id);
  }

  /**
   * Get all messages for an ad
   * Only ad owner and message participants can view
   */
  @Get('ad/:adId')
  @ApiOperation({ summary: 'Get all messages for an ad' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  findByAd(@Param('adId', ParseUUIDPipe) adId: string, @CurrentUser() user: User) {
    return this.messagesService.findByAd(adId, user.id);
  }

  /**
   * Get current user's inbox
   * Must be before GET(':id') to avoid route conflicts
   * For admins: includes both sent and received messages
   */
  @Get('inbox/my')
  @ApiOperation({ summary: "Get current user's inbox" })
  @ApiResponse({ status: 200, description: 'Inbox retrieved successfully' })
  findMyInbox(@CurrentUser() user: User) {
    return this.messagesService.findByUser(user.id, user.role?.name);
  }

  /**
   * Get unread messages count
   * Must be before GET(':id') to avoid route conflicts
   */
  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread messages count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.messagesService.getUnreadCount(user.id);
    return { count };
  }

  /**
   * Mark message as read
   * Must be before GET(':id') to avoid route conflicts
   */
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  markAsRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.messagesService.markAsRead(id, user.id);
  }

  /**
   * Delete message (soft delete)
   * Only sender or receiver can delete
   * Must be before GET(':id') to avoid route conflicts
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    await this.messagesService.remove(id, user.id);
    return { message: 'Message deleted successfully' };
  }

  /**
   * Get all messages with filters (Super Admin only)
   * Must be before GET(':id') to avoid route conflicts
   */
  @Get('admin/all')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(RoleType.SUPER_ADMIN)
  @Permissions('messages.view')
  @ApiOperation({ summary: 'Get all messages with filters (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async findAllForSuperAdmin(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('senderName') senderName?: string,
    @Query('receiverName') receiverName?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = {
      page: page ? parseInt(page.toString(), 10) : undefined,
      limit: limit ? parseInt(limit.toString(), 10) : undefined,
      senderName,
      receiverName,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };
    return this.messagesService.findAllWithFilters(filters);
  }

  /**
   * Get admin's messages with filters (Admin only)
   * Must be before GET(':id') to avoid route conflicts
   */
  @Get('admin/my')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @Permissions('messages.view')
  @ApiOperation({ summary: "Get admin's messages with filters" })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async findAdminMessages(
    @CurrentUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('senderName') senderName?: string,
    @Query('receiverName') receiverName?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters = {
      page: page ? parseInt(page.toString(), 10) : undefined,
      limit: limit ? parseInt(limit.toString(), 10) : undefined,
      senderName,
      receiverName,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };
    return this.messagesService.findAdminMessages(user.id, filters);
  }

  /**
   * Get all messages for a specific user (Super Admin only)
   * Must be before GET(':id') to avoid route conflicts
   */
  @Get('user/:userId')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(RoleType.SUPER_ADMIN)
  @Permissions('messages.view')
  @ApiOperation({ summary: 'Get all messages for a specific user (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  async findByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const filters = {
      page: page ? parseInt(page.toString(), 10) : undefined,
      limit: limit ? parseInt(limit.toString(), 10) : undefined,
    };
    return this.messagesService.findByUserId(userId, filters);
  }

  /**
   * Get message by ID for admin
   * Admin can view any message
   * Must be before GET(':id') to avoid route conflicts
   */
  @Get('admin/:id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @Permissions('messages.view')
  @ApiOperation({ summary: 'Get message by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Message retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  findOneForAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.messagesService.findOneForAdmin(id);
  }

  /**
   * Get message by ID
   * Must be last as it's a catch-all parameterized route
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get message by ID' })
  @ApiResponse({ status: 200, description: 'Message retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.messagesService.findOne(id, user.id);
  }
}

