import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../../entities/user.entity';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<User | null>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            roleId: string;
            isBlocked: boolean;
            isSuspended: boolean;
            suspendedUntil: Date;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date;
            role: import("../../entities/role.entity").Role;
            ads: import("../../entities/ad.entity").Ad[];
            sentMessages: import("../../entities/message.entity").Message[];
            receivedMessages: import("../../entities/message.entity").Message[];
            adminPermissions: import("../../entities/admin-permission.entity").AdminPermission[];
            reports: import("../../entities/report.entity").Report[];
            auditLogs: import("../../entities/audit-log.entity").AuditLog[];
        };
        access_token: string;
        refresh_token: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        access_token: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    signup(createUserDto: CreateUserDto): Promise<{
        user: Omit<User, "password" | "refreshToken">;
        access_token: string;
        refresh_token: string;
    }>;
}
