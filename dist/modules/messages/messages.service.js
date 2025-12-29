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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("../../entities/message.entity");
const ad_entity_1 = require("../../entities/ad.entity");
const user_entity_1 = require("../../entities/user.entity");
const role_entity_1 = require("../../entities/role.entity");
let MessagesService = class MessagesService {
    constructor(messagesRepository, adsRepository, usersRepository) {
        this.messagesRepository = messagesRepository;
        this.adsRepository = adsRepository;
        this.usersRepository = usersRepository;
    }
    async create(createMessageDto, senderId) {
        const ad = await this.adsRepository.findOne({
            where: { id: createMessageDto.adId, deletedAt: null },
            relations: ['user'],
        });
        if (!ad) {
            throw new common_1.NotFoundException(`Ad with ID ${createMessageDto.adId} not found`);
        }
        if (ad.userId === senderId) {
            throw new common_1.ForbiddenException('You cannot send a message to yourself');
        }
        const message = this.messagesRepository.create({
            ...createMessageDto,
            senderId,
            receiverId: ad.userId,
        });
        const savedMessage = await this.messagesRepository.save(message);
        return savedMessage;
    }
    async findByAd(adId, userId) {
        const ad = await this.adsRepository.findOne({
            where: { id: adId, deletedAt: null },
        });
        if (!ad) {
            throw new common_1.NotFoundException(`Ad with ID ${adId} not found`);
        }
        const messages = await this.messagesRepository.find({
            where: [
                { adId, senderId: userId, deletedAt: null },
                { adId, receiverId: userId, deletedAt: null },
            ],
            relations: ['sender', 'receiver', 'ad'],
            order: { createdAt: 'DESC' },
        });
        return messages;
    }
    async findOne(id, userId) {
        const message = await this.messagesRepository.findOne({
            where: { id, deletedAt: null },
            relations: ['sender', 'receiver', 'ad'],
        });
        if (!message) {
            throw new common_1.NotFoundException(`Message with ID ${id} not found`);
        }
        if (message.senderId !== userId && message.receiverId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to view this message');
        }
        return message;
    }
    async findOneForAdmin(id) {
        const message = await this.messagesRepository.findOne({
            where: { id, deletedAt: null },
            relations: ['sender', 'receiver', 'ad'],
        });
        if (!message) {
            throw new common_1.NotFoundException(`Message with ID ${id} not found`);
        }
        return message;
    }
    async findByUser(userId, userRole) {
        const isAdmin = userRole === role_entity_1.RoleType.ADMIN || userRole === role_entity_1.RoleType.SUPER_ADMIN;
        const whereConditions = isAdmin
            ? [
                { senderId: userId, deletedAt: null },
                { receiverId: userId, deletedAt: null },
            ]
            : [{ receiverId: userId, deletedAt: null }];
        const messages = await this.messagesRepository.find({
            where: whereConditions,
            relations: ['sender', 'receiver', 'ad'],
            order: { createdAt: 'DESC' },
        });
        return messages;
    }
    async markAsRead(id, userId) {
        const message = await this.findOne(id, userId);
        if (message.receiverId !== userId) {
            throw new common_1.ForbiddenException('Only the receiver can mark a message as read');
        }
        message.isRead = true;
        return this.messagesRepository.save(message);
    }
    async remove(id, userId) {
        const message = await this.findOne(id, userId);
        if (message.senderId !== userId && message.receiverId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this message');
        }
        message.deletedAt = new Date();
        await this.messagesRepository.save(message);
    }
    async getUnreadCount(userId) {
        return this.messagesRepository.count({
            where: {
                receiverId: userId,
                isRead: false,
                deletedAt: null,
            },
        });
    }
    async findAllWithFilters(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        const queryBuilder = this.messagesRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('message.receiver', 'receiver')
            .leftJoinAndSelect('message.ad', 'ad')
            .where('message.deletedAt IS NULL');
        if (filters.senderName) {
            queryBuilder.andWhere('sender.name ILIKE :senderName', {
                senderName: `%${filters.senderName}%`,
            });
        }
        if (filters.receiverName) {
            queryBuilder.andWhere('receiver.name ILIKE :receiverName', {
                receiverName: `%${filters.receiverName}%`,
            });
        }
        if (filters.startDate) {
            queryBuilder.andWhere('message.createdAt >= :startDate', {
                startDate: filters.startDate,
            });
        }
        if (filters.endDate) {
            queryBuilder.andWhere('message.createdAt <= :endDate', {
                endDate: filters.endDate,
            });
        }
        const [data, total] = await queryBuilder
            .orderBy('message.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findAdminMessages(adminId, filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;
        const queryBuilder = this.messagesRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('message.receiver', 'receiver')
            .leftJoinAndSelect('message.ad', 'ad')
            .where('message.deletedAt IS NULL')
            .andWhere('(message.senderId = :adminId OR message.receiverId = :adminId)', {
            adminId,
        });
        if (filters.senderName) {
            queryBuilder.andWhere('sender.name ILIKE :senderName', {
                senderName: `%${filters.senderName}%`,
            });
        }
        if (filters.receiverName) {
            queryBuilder.andWhere('receiver.name ILIKE :receiverName', {
                receiverName: `%${filters.receiverName}%`,
            });
        }
        if (filters.startDate) {
            queryBuilder.andWhere('message.createdAt >= :startDate', {
                startDate: filters.startDate,
            });
        }
        if (filters.endDate) {
            queryBuilder.andWhere('message.createdAt <= :endDate', {
                endDate: filters.endDate,
            });
        }
        const [data, total] = await queryBuilder
            .orderBy('message.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findByUserId(userId, filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;
        const queryBuilder = this.messagesRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('message.receiver', 'receiver')
            .leftJoinAndSelect('message.ad', 'ad')
            .where('message.deletedAt IS NULL')
            .andWhere('(message.senderId = :userId OR message.receiverId = :userId)', {
            userId,
        });
        const [data, total] = await queryBuilder
            .orderBy('message.createdAt', 'DESC')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            data,
            total,
            page,
            limit,
        };
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __param(1, (0, typeorm_1.InjectRepository)(ad_entity_1.Ad)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MessagesService);
//# sourceMappingURL=messages.service.js.map