"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../entities/user.entity");
const role_entity_1 = require("../../entities/role.entity");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const audit_log_entity_1 = require("../../entities/audit-log.entity");
let UsersService = class UsersService {
    constructor(usersRepository, roleRepository, auditLogService) {
        this.usersRepository = usersRepository;
        this.roleRepository = roleRepository;
        this.auditLogService = auditLogService;
    }
    async findOne(id) {
        const user = await this.usersRepository.findOne({
            where: { id, deletedAt: null },
            relations: ['role'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findOneWithRole(id) {
        return this.findOne(id);
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({
            where: { email, deletedAt: null },
            relations: ['role'],
        });
    }
    async create(createUserDto) {
        const existingUser = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const userRole = await this.roleRepository.findOne({
            where: { name: role_entity_1.RoleType.USER },
        });
        if (!userRole) {
            throw new common_1.NotFoundException('USER role not found');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
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
    async createAdmin(createUserDto, createdBy) {
        const existingUser = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const adminRole = await this.roleRepository.findOne({
            where: { name: role_entity_1.RoleType.ADMIN },
        });
        if (!adminRole) {
            throw new common_1.NotFoundException('ADMIN role not found');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const { role, ...userData } = createUserDto;
        const user = this.usersRepository.create({
            ...userData,
            password: hashedPassword,
            roleId: adminRole.id,
        });
        const savedUser = await this.usersRepository.save(user);
        await this.auditLogService.log({
            action: audit_log_entity_1.AuditAction.ADMIN_CREATED,
            adminId: createdBy.id,
            entityType: 'user',
            entityId: savedUser.id,
            newValues: { email: savedUser.email, name: savedUser.name },
            description: `Admin user created: ${savedUser.email}`,
        });
        const { password, refreshToken, ...result } = savedUser;
        return result;
    }
    async update(id, updateUserDto) {
        const user = await this.findOne(id);
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.findByEmail(updateUserDto.email);
            if (existingUser) {
                throw new common_1.ConflictException('User with this email already exists');
            }
        }
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        Object.assign(user, updateUserDto);
        const savedUser = await this.usersRepository.save(user);
        const { password, refreshToken, ...result } = savedUser;
        return result;
    }
    async blockUser(userId, admin) {
        const user = await this.findOne(userId);
        if (user.isBlocked) {
            throw new common_1.ConflictException('User is already blocked');
        }
        user.isBlocked = true;
        const savedUser = await this.usersRepository.save(user);
        await this.auditLogService.log({
            action: audit_log_entity_1.AuditAction.USER_BLOCKED,
            adminId: admin.id,
            entityType: 'user',
            entityId: userId,
            description: `User blocked: ${user.email}`,
        });
        return savedUser;
    }
    async unblockUser(userId, admin) {
        const user = await this.findOne(userId);
        if (!user.isBlocked) {
            throw new common_1.ConflictException('User is not blocked');
        }
        user.isBlocked = false;
        const savedUser = await this.usersRepository.save(user);
        await this.auditLogService.log({
            action: audit_log_entity_1.AuditAction.USER_UNBLOCKED,
            adminId: admin.id,
            entityType: 'user',
            entityId: userId,
            description: `User unblocked: ${user.email}`,
        });
        return savedUser;
    }
    async suspendUser(userId, until, admin) {
        const user = await this.findOne(userId);
        if (until <= new Date()) {
            throw new common_1.ConflictException('Suspension date must be in the future');
        }
        user.isSuspended = true;
        user.suspendedUntil = until;
        const savedUser = await this.usersRepository.save(user);
        await this.auditLogService.log({
            action: audit_log_entity_1.AuditAction.USER_SUSPENDED,
            adminId: admin.id,
            entityType: 'user',
            entityId: userId,
            newValues: { suspendedUntil: until },
            description: `User suspended until: ${until.toISOString()}`,
        });
        return savedUser;
    }
    async findAll(filters) {
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
    async remove(id) {
        const user = await this.findOne(id);
        user.deletedAt = new Date();
        await this.usersRepository.save(user);
    }
    async updateRefreshToken(userId, refreshToken) {
        await this.usersRepository.update(userId, { refreshToken });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        audit_log_service_1.AuditLogService])
], UsersService);
//# sourceMappingURL=users.service.js.map