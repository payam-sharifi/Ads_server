"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const image_entity_1 = require("../../entities/image.entity");
const ad_entity_1 = require("../../entities/ad.entity");
const fs = require("fs");
const path = require("path");
let ImagesService = class ImagesService {
    constructor(imagesRepository, adsRepository) {
        this.imagesRepository = imagesRepository;
        this.adsRepository = adsRepository;
    }
    async uploadImage(file, adId, order) {
        const ad = await this.adsRepository.findOne({ where: { id: adId, deletedAt: null } });
        if (!ad) {
            throw new common_1.NotFoundException(`Ad with ID ${adId} not found`);
        }
        const fileName = file.filename;
        const fileUrl = `/uploads/${fileName}`;
        const maxOrder = await this.imagesRepository
            .createQueryBuilder('image')
            .where('image.adId = :adId', { adId })
            .select('MAX(image.order)', 'maxOrder')
            .getRawOne();
        const image = this.imagesRepository.create({
            url: fileUrl,
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            adId,
            order: order ?? (maxOrder?.maxOrder ?? 0) + 1,
        });
        return this.imagesRepository.save(image);
    }
    async findByAd(adId) {
        return this.imagesRepository.find({
            where: { adId },
            order: { order: 'ASC', createdAt: 'ASC' },
        });
    }
    async findOne(id) {
        const image = await this.imagesRepository.findOne({ where: { id } });
        if (!image) {
            throw new common_1.NotFoundException(`Image with ID ${id} not found`);
        }
        return image;
    }
    async remove(id) {
        const image = await this.findOne(id);
        const filePath = path.join(process.env.UPLOAD_DEST || './public/uploads', path.basename(image.url));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        await this.imagesRepository.remove(image);
    }
};
exports.ImagesService = ImagesService;
exports.ImagesService = ImagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(image_entity_1.Image)),
    __param(1, (0, typeorm_1.InjectRepository)(ad_entity_1.Ad)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ImagesService);
//# sourceMappingURL=images.service.js.map