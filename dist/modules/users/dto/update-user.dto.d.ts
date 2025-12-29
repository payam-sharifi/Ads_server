import { RoleType } from '../../../entities/role.entity';
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    role?: RoleType;
}
