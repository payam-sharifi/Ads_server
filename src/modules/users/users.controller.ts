import {
  Controller,
  Get,
  Put,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Permissions } from '../../decorators/permissions.decorator';
import { RoleType } from '../../entities/role.entity';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

/**
 * Users Controller
 * 
 * Endpoints:
 * - GET /api/users/profile - Get current user profile (requires auth)
 * - PUT /api/users/profile - Update current user profile (requires auth)
 * 
 * All endpoints require JWT authentication.
 * Include token in Authorization header: "Bearer <token>"
 */
@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user profile
   * 
   * Request:
   *   GET /api/users/profile
   *   Headers: { Authorization: "Bearer <token>" }
   * 
   * Response:
   *   {
   *     "id": "uuid",
   *     "name": "John Doe",
   *     "email": "john@example.com",
   *     "phone": "+49 123 456789",
   *     "role": "user",
   *     "createdAt": "2024-01-01T00:00:00.000Z",
   *     "updatedAt": "2024-01-01T00:00:00.000Z"
   *   }
   */
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: User): Promise<Omit<User, 'password' | 'refreshToken'>> {
    const userProfile = await this.usersService.findOne(user.id);
    const { password, refreshToken, ...result } = userProfile;
    return result;
  }

  /**
   * Update current user profile
   * 
   * Request:
   *   PUT /api/users/profile
   *   Headers: { Authorization: "Bearer <token>" }
   *   Body: {
   *     "name": "Updated Name",  // optional
   *     "email": "newemail@example.com",  // optional
   *     "phone": "+49 987 654321",  // optional
   *     "password": "newPassword123"  // optional
   *   }
   * 
   * Response: Updated user object (without password)
   */
  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password' | 'refreshToken'>> {
    return this.usersService.update(user.id, updateUserDto);
  }

  /**
   * Admin endpoints
   */

  @Get()
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @Permissions('users.view')
  @ApiOperation({ summary: 'Get all users (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@Query() filters: any, @CurrentUser() user: User) {
    return this.usersService.findAll(filters);
  }

  @Get(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @Permissions('users.view')
  @ApiOperation({ summary: 'Get user by ID (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Post('admin')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(RoleType.SUPER_ADMIN)
  @Permissions('admins.manage')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create admin user (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Admin created successfully' })
  async createAdmin(@Body() createUserDto: CreateUserDto, @CurrentUser() user: User) {
    return this.usersService.createAdmin(createUserDto, user);
  }

  @Patch(':id/block')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @Permissions('users.block')
  @ApiOperation({ summary: 'Block user (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User blocked successfully' })
  async blockUser(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.usersService.blockUser(id, user);
  }

  @Patch(':id/unblock')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @Permissions('users.block')
  @ApiOperation({ summary: 'Unblock user (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User unblocked successfully' })
  async unblockUser(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.usersService.unblockUser(id, user);
  }

  @Patch(':id/suspend')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @Permissions('users.suspend')
  @ApiOperation({ summary: 'Suspend user (Admin/Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User suspended successfully' })
  async suspendUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { until: string },
    @CurrentUser() user: User,
  ) {
    return this.usersService.suspendUser(id, new Date(body.until), user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard, PermissionsGuard)
  @Roles(RoleType.SUPER_ADMIN)
  @Permissions('users.edit')
  @ApiOperation({ summary: 'Update user (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }
}

