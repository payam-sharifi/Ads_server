import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../../entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: User): Promise<Omit<User, 'password' | 'refreshToken'>>;
    updateProfile(user: User, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password' | 'refreshToken'>>;
    findAll(filters: any, user: User): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<User>;
    createAdmin(createUserDto: CreateUserDto, user: User): Promise<Omit<User, "password" | "refreshToken">>;
    blockUser(id: string, user: User): Promise<User>;
    unblockUser(id: string, user: User): Promise<User>;
    suspendUser(id: string, body: {
        until: string;
    }, user: User): Promise<User>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<Omit<User, "password" | "refreshToken">>;
}
