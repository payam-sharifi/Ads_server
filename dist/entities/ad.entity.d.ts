import { User } from './user.entity';
import { Category } from './category.entity';
import { City } from './city.entity';
import { Image } from './image.entity';
import { Message } from './message.entity';
export declare enum AdStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED",
    SUSPENDED = "SUSPENDED"
}
export declare enum AdCondition {
    NEW = "new",
    LIKE_NEW = "like-new",
    USED = "used"
}
export declare class Ad {
    id: string;
    title: string;
    description: string;
    price: number;
    categoryId: string;
    subcategoryId: string;
    userId: string;
    cityId: string;
    status: AdStatus;
    rejectionReason: string;
    approvedBy: string;
    rejectedBy: string;
    approvedAt: Date;
    rejectedAt: Date;
    condition: AdCondition;
    views: number;
    isPremium: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    user: User;
    category: Category;
    subcategory: Category;
    city: City;
    images: Image[];
    messages: Message[];
    approver: User;
    rejector: User;
}
