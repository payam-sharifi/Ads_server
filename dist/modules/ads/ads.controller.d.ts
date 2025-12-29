import { AdsService } from './ads.service';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { FilterAdsDto } from './dto/filter-ads.dto';
import { ApproveAdDto } from './dto/approve-ad.dto';
import { RejectAdDto } from './dto/reject-ad.dto';
import { User } from '../../entities/user.entity';
export declare class AdsController {
    private readonly adsService;
    constructor(adsService: AdsService);
    findAll(filters: FilterAdsDto, user?: User): Promise<{
        data: import("../../entities/ad.entity").Ad[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, user?: User): Promise<import("../../entities/ad.entity").Ad>;
    findMyAds(user: User): Promise<import("../../entities/ad.entity").Ad[]>;
    findUserAds(userId: string, user: User): Promise<import("../../entities/ad.entity").Ad[]>;
    approve(id: string, approveAdDto: ApproveAdDto, user: User): Promise<import("../../entities/ad.entity").Ad>;
    reject(id: string, rejectAdDto: RejectAdDto, user: User): Promise<import("../../entities/ad.entity").Ad>;
    create(createAdDto: CreateAdDto, user: User): Promise<import("../../entities/ad.entity").Ad>;
    update(id: string, updateAdDto: UpdateAdDto, user: User): Promise<import("../../entities/ad.entity").Ad>;
    suspend(id: string, user: User): Promise<import("../../entities/ad.entity").Ad>;
    unsuspend(id: string, user: User): Promise<import("../../entities/ad.entity").Ad>;
    remove(id: string, user: User): Promise<void>;
}
