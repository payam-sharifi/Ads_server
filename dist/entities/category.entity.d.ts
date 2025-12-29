import { Ad } from './ad.entity';
export declare class Category {
    id: string;
    name: {
        fa?: string;
        de?: string;
        en?: string;
    };
    icon: string;
    parentId: string;
    parent: Category;
    children: Category[];
    ads: Ad[];
    subcategoryAds: Ad[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
