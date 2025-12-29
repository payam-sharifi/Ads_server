import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
export declare class UsersService {
    private usersRepository;
    private roleRepository;
    private auditLogService;
    constructor(usersRepository: Repository<User>, roleRepository: Repository<Role>, auditLogService: AuditLogService);
    findOne(id: string): Promise<User>;
    findOneWithRole(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    create(createUserDto: CreateUserDto): Promise<Omit<User, 'password' | 'refreshToken'>>;
    createAdmin(createUserDto: CreateUserDto, createdBy: User): Promise<Omit<User, 'password' | 'refreshToken'>>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password' | 'refreshToken'>>;
    blockUser(userId: string, admin: User): Promise<User>;
    unblockUser(userId: string, admin: User): Promise<User>;
    suspendUser(userId: string, until: Date, admin: User): Promise<User>;
    findAll(filters?: {
        roleId?: string;
        isBlocked?: boolean;
        isSuspended?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
    }>;
    remove(id: string): Promise<void>;
    updateRefreshToken(userId: string, refreshToken: string | null): Promise<void>;
}
