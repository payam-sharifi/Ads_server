import { AdStatus } from '../../../entities/ad.entity';
export declare class FilterAdsDto {
    categoryId?: string;
    subcategoryId?: string;
    cityId?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: AdStatus;
    search?: string;
    userId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}
