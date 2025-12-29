import { AdCondition } from '../../../entities/ad.entity';
export declare class CreateAdDto {
    title: string;
    description: string;
    price: number;
    categoryId: string;
    subcategoryId?: string;
    cityId: string;
    condition?: AdCondition;
}
