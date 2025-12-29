import { Repository } from 'typeorm';
import { Image } from '../../entities/image.entity';
import { Ad } from '../../entities/ad.entity';
export declare class ImagesService {
    private imagesRepository;
    private adsRepository;
    constructor(imagesRepository: Repository<Image>, adsRepository: Repository<Ad>);
    uploadImage(file: Express.Multer.File, adId: string, order?: number): Promise<Image>;
    findByAd(adId: string): Promise<Image[]>;
    findOne(id: string): Promise<Image>;
    remove(id: string): Promise<void>;
}
