import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Permissions } from '../../decorators/permissions.decorator';
import { RoleType } from '../../entities/role.entity';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

@ApiTags('Reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new report' })
  async create(@Body() createReportDto: CreateReportDto, @CurrentUser() user: User) {
    return this.reportsService.create(createReportDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @Permissions('messages.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reports (Admin/Super Admin only)' })
  async findAll(@Query() filters: any) {
    return this.reportsService.findAll(filters);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(RoleType.SUPER_ADMIN)
  @Permissions('messages.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reports by reporter ID (Super Admin only)' })
  async findByReporterId(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const filters = {
      page: page ? parseInt(page.toString(), 10) : undefined,
      limit: limit ? parseInt(limit.toString(), 10) : undefined,
    };
    return this.reportsService.findByReporterId(userId, filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @Permissions('messages.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get report by ID (Admin/Super Admin only)' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles(RoleType.ADMIN, RoleType.SUPER_ADMIN)
  @Permissions('messages.view')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update report status (Admin/Super Admin only)' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateReportStatusDto,
  ) {
    return this.reportsService.updateStatus(id, updateDto);
  }
}

