import { Ad } from './ad.entity';
export declare class Image {
    id: string;
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    adId: string;
    order: number;
    createdAt: Date;
    ad: Ad;
}
