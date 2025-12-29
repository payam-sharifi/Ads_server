import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../../entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(createUserDto: CreateUserDto): Promise<{
        user: Omit<User, "password" | "refreshToken">;
        access_token: string;
        refresh_token: string;
    }>;
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
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        access_token: string;
    }>;
    logout(user: User): Promise<{
        message: string;
    }>;
}
