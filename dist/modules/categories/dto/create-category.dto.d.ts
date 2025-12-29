declare class CategoryNameDto {
    fa?: string;
    de?: string;
    en?: string;
}
export declare class CreateCategoryDto {
    name: CategoryNameDto;
    icon?: string;
    parentId?: string;
}
export {};
