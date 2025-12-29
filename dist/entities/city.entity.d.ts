import { Ad } from './ad.entity';
export declare class City {
    id: string;
    name: {
        fa?: string;
        de?: string;
        en?: string;
    };
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    ads: Ad[];
}
