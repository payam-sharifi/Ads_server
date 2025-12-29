import { User } from './user.entity';
export declare enum RoleType {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    USER = "USER"
}
export declare class Role {
    id: string;
    name: RoleType;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    users: User[];
}
