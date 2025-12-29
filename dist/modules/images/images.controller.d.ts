import { ImagesService } from './images.service';
import { User } from '../../entities/user.entity';
import { AdsService } from '../ads/ads.service';
export declare class ImagesController {
    private readonly imagesService;
    private readonly adsService;
    constructor(imagesService: ImagesService, adsService: AdsService);
    uploadImage(adId: string, file: Express.Multer.File, order: number, user: User): Promise<import("../../entities/image.entity").Image>;
    findByAd(adId: string): Promise<import("../../entities/image.entity").Image[]>;
    findOne(id: string): Promise<import("../../entities/image.entity").Image>;
    remove(id: string, user: User): Promise<void>;
}
