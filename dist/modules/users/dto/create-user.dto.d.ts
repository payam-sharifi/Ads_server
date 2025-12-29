import { RoleType } from '../../../entities/role.entity';
export declare class CreateUserDto {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: RoleType;
}
