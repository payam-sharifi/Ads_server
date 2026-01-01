import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import { Role, RoleType } from '../../entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../../entities/audit-log.entity';

/**
 * Users Service
 * 
 * Handles all user-related business logic:
 * - User creation (signup)
 * - User retrieval
 * - User profile updates
 * - Admin management
 * - User blocking/suspension
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private auditLogService: AuditLogService,
  ) {}

  /**
   * Find user by ID with role
   */
  async findOne(id: string): Promise<User> {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/8e3d4fb4-043c-450e-b118-fed88d4cad9f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users.service.ts:findOne',message:'Finding user by ID',data:{userId:id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    const user = await this.usersRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['role'],
    });

    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/8e3d4fb4-043c-450e-b118-fed88d4cad9f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users.service.ts:findOne',message:'User query result',data:{userFound:!!user,userId:user?.id,userEmail:user?.email,deletedAt:user?.deletedAt},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    if (!user) {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/8e3d4fb4-043c-450e-b118-fed88d4cad9f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users.service.ts:findOne',message:'User not found - throwing NotFoundException',data:{userId:id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find user by ID with role (for JWT strategy)
   */
  async findOneWithRole(id: string): Promise<User> {
    return this.findOne(id);
  }

  /**
   * Find user by email (for login)
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email, deletedAt: null },
      relations: ['role'],
    });
  }

  /**
   * Create a new user with hashed password
   * Default role is USER
   */
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password' | 'refreshToken'>> {
    // Check if user with email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Get USER role
    const userRole = await this.roleRepository.findOne({
      where: { name: RoleType.USER },
    });

    if (!userRole) {
      throw new NotFoundException('USER role not found');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user (exclude 'role' from DTO as it's not a User property)
    const { role, ...userData } = createUserDto;
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      roleId: userRole.id,
    });

    const savedUser = await this.usersRepository.save(user);
    const { password, refreshToken, ...result } = savedUser;
    return result;
  }

  /**
   * Create an admin user (Super Admin only)
   */
  async createAdmin(createUserDto: CreateUserDto, createdBy: User): Promise<Omit<User, 'password' | 'refreshToken'>> {
    // Check if user with email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Get ADMIN role
    const adminRole = await this.roleRepository.findOne({
      where: { name: RoleType.ADMIN },
    });

    if (!adminRole) {
      throw new NotFoundException('ADMIN role not found');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create admin user (exclude 'role' from DTO as it's not a User property)
    const { role, ...userData } = createUserDto;
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      roleId: adminRole.id,
    });

    const savedUser = await this.usersRepository.save(user);

    // Log action
    await this.auditLogService.log({
      action: AuditAction.ADMIN_CREATED,
      adminId: createdBy.id,
      entityType: 'user',
      entityId: savedUser.id,
      newValues: { email: savedUser.email, name: savedUser.name },
      description: `Admin user created: ${savedUser.email}`,
    });

    const { password, refreshToken, ...result } = savedUser;
    return result;
  }

  /**
   * Update user profile
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password' | 'refreshToken'>> {
    const user = await this.findOne(id);

    // If email is being updated, check for conflicts
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Hash password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user
    Object.assign(user, updateUserDto);
    const savedUser = await this.usersRepository.save(user);
    const { password, refreshToken, ...result } = savedUser;
    return result;
  }

  /**
   * Block user (Admin/Super Admin)
   */
  async blockUser(userId: string, admin: User): Promise<User> {
    const user = await this.findOne(userId);

    if (user.isBlocked) {
      throw new ConflictException('User is already blocked');
    }

    user.isBlocked = true;
    const savedUser = await this.usersRepository.save(user);

    // Log action
    await this.auditLogService.log({
      action: AuditAction.USER_BLOCKED,
      adminId: admin.id,
      entityType: 'user',
      entityId: userId,
      description: `User blocked: ${user.email}`,
    });

    return savedUser;
  }

  /**
   * Unblock user (Admin/Super Admin)
   */
  async unblockUser(userId: string, admin: User): Promise<User> {
    const user = await this.findOne(userId);

    if (!user.isBlocked) {
      throw new ConflictException('User is not blocked');
    }

    user.isBlocked = false;
    const savedUser = await this.usersRepository.save(user);

    // Log action
    await this.auditLogService.log({
      action: AuditAction.USER_UNBLOCKED,
      adminId: admin.id,
      entityType: 'user',
      entityId: userId,
      description: `User unblocked: ${user.email}`,
    });

    return savedUser;
  }

  /**
   * Suspend user (Admin/Super Admin)
   */
  async suspendUser(userId: string, until: Date, admin: User): Promise<User> {
    const user = await this.findOne(userId);

    if (until <= new Date()) {
      throw new ConflictException('Suspension date must be in the future');
    }

    user.isSuspended = true;
    user.suspendedUntil = until;
    const savedUser = await this.usersRepository.save(user);

    // Log action
    await this.auditLogService.log({
      action: AuditAction.USER_SUSPENDED,
      adminId: admin.id,
      entityType: 'user',
      entityId: userId,
      newValues: { suspendedUntil: until },
      description: `User suspended until: ${until.toISOString()}`,
    });

    return savedUser;
  }

  /**
   * Get all users (Admin/Super Admin)
   */
  async findAll(filters?: {
    roleId?: string;
    isBlocked?: boolean;
    isSuspended?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const query = this.usersRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.deletedAt IS NULL');

    if (filters?.roleId) {
      query.andWhere('user.roleId = :roleId', { roleId: filters.roleId });
    }

    if (filters?.isBlocked !== undefined) {
      query.andWhere('user.isBlocked = :isBlocked', { isBlocked: filters.isBlocked });
    }

    if (filters?.isSuspended !== undefined) {
      query.andWhere('user.isSuspended = :isSuspended', { isSuspended: filters.isSuspended });
    }

    const [data, total] = await query
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Soft delete user
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.deletedAt = new Date();
    await this.usersRepository.save(user);
  }

  /**
   * Update refresh token
   */
  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await this.usersRepository.update(userId, { refreshToken });
  }
}
