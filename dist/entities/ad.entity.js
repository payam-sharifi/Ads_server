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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ad = exports.AdCondition = exports.AdStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const category_entity_1 = require("./category.entity");
const city_entity_1 = require("./city.entity");
const image_entity_1 = require("./image.entity");
const message_entity_1 = require("./message.entity");
var AdStatus;
(function (AdStatus) {
    AdStatus["DRAFT"] = "DRAFT";
    AdStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    AdStatus["APPROVED"] = "APPROVED";
    AdStatus["REJECTED"] = "REJECTED";
    AdStatus["EXPIRED"] = "EXPIRED";
    AdStatus["SUSPENDED"] = "SUSPENDED";
})(AdStatus || (exports.AdStatus = AdStatus = {}));
var AdCondition;
(function (AdCondition) {
    AdCondition["NEW"] = "new";
    AdCondition["LIKE_NEW"] = "like-new";
    AdCondition["USED"] = "used";
})(AdCondition || (exports.AdCondition = AdCondition = {}));
let Ad = class Ad {
};
exports.Ad = Ad;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Ad.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Ad.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Ad.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Ad.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'category_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Ad.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'subcategory_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Ad.prototype, "subcategoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'user_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Ad.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'city_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Ad.prototype, "cityId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AdStatus,
        default: AdStatus.PENDING_APPROVAL,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Ad.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'rejection_reason' }),
    __metadata("design:type", String)
], Ad.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'approved_by' }),
    __metadata("design:type", String)
], Ad.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'rejected_by' }),
    __metadata("design:type", String)
], Ad.prototype, "rejectedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'approved_at' }),
    __metadata("design:type", Date)
], Ad.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'rejected_at' }),
    __metadata("design:type", Date)
], Ad.prototype, "rejectedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AdCondition,
        nullable: true,
    }),
    __metadata("design:type", String)
], Ad.prototype, "condition", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Ad.prototype, "views", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false, name: 'is_premium' }),
    __metadata("design:type", Boolean)
], Ad.prototype, "isPremium", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', name: 'created_at' }),
    __metadata("design:type", Date)
], Ad.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp', name: 'updated_at' }),
    __metadata("design:type", Date)
], Ad.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true, name: 'deleted_at' }),
    __metadata("design:type", Date)
], Ad.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.ads),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Ad.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, (category) => category.ads),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", category_entity_1.Category)
], Ad.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, (category) => category.subcategoryAds, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'subcategory_id' }),
    __metadata("design:type", category_entity_1.Category)
], Ad.prototype, "subcategory", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => city_entity_1.City, (city) => city.ads),
    (0, typeorm_1.JoinColumn)({ name: 'city_id' }),
    __metadata("design:type", city_entity_1.City)
], Ad.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => image_entity_1.Image, (image) => image.ad),
    __metadata("design:type", Array)
], Ad.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (message) => message.ad),
    __metadata("design:type", Array)
], Ad.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by' }),
    __metadata("design:type", user_entity_1.User)
], Ad.prototype, "approver", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'rejected_by' }),
    __metadata("design:type", user_entity_1.User)
], Ad.prototype, "rejector", void 0);
exports.Ad = Ad = __decorate([
    (0, typeorm_1.Entity)('ads')
], Ad);
//# sourceMappingURL=ad.entity.js.map