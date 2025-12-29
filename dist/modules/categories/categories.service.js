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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("../../entities/category.entity");
let CategoriesService = class CategoriesService {
    constructor(categoriesRepository) {
        this.categoriesRepository = categoriesRepository;
    }
    async findAll() {
        return this.categoriesRepository.find({
            where: { parentId: null, deletedAt: null },
            relations: ['children'],
            order: { createdAt: 'ASC' },
        });
    }
    async findOne(id) {
        const category = await this.categoriesRepository.findOne({
            where: { id, deletedAt: null },
            relations: ['parent', 'children'],
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }
    async create(createCategoryDto) {
        if (createCategoryDto.parentId) {
            const parent = await this.categoriesRepository.findOne({
                where: { id: createCategoryDto.parentId, deletedAt: null },
            });
            if (!parent) {
                throw new common_1.NotFoundException(`Parent category with ID ${createCategoryDto.parentId} not found`);
            }
        }
        const category = this.categoriesRepository.create({
            ...createCategoryDto,
            parentId: createCategoryDto.parentId || null,
        });
        return this.categoriesRepository.save(category);
    }
    async update(id, updateCategoryDto) {
        const category = await this.findOne(id);
        if (updateCategoryDto.parentId !== undefined) {
            if (updateCategoryDto.parentId === id) {
                throw new common_1.ConflictException('Category cannot be its own parent');
            }
            if (updateCategoryDto.parentId) {
                const parent = await this.categoriesRepository.findOne({
                    where: { id: updateCategoryDto.parentId, deletedAt: null },
                });
                if (!parent) {
                    throw new common_1.NotFoundException(`Parent category with ID ${updateCategoryDto.parentId} not found`);
                }
                const isDescendant = await this.isDescendant(id, updateCategoryDto.parentId);
                if (isDescendant) {
                    throw new common_1.ConflictException('Circular reference detected');
                }
            }
        }
        Object.assign(category, updateCategoryDto);
        return this.categoriesRepository.save(category);
    }
    async remove(id) {
        const category = await this.findOne(id);
        category.deletedAt = new Date();
        await this.categoriesRepository.save(category);
    }
    async isDescendant(ancestorId, descendantId) {
        const category = await this.categoriesRepository.findOne({
            where: { id: descendantId },
            relations: ['parent'],
        });
        if (!category || !category.parentId) {
            return false;
        }
        if (category.parentId === ancestorId) {
            return true;
        }
        return this.isDescendant(ancestorId, category.parentId);
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map