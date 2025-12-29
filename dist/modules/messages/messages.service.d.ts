import { Repository } from 'typeorm';
import { Message } from '../../entities/message.entity';
import { Ad } from '../../entities/ad.entity';
import { User } from '../../entities/user.entity';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class MessagesService {
    private messagesRepository;
    private adsRepository;
    private usersRepository;
    constructor(messagesRepository: Repository<Message>, adsRepository: Repository<Ad>, usersRepository: Repository<User>);
    create(createMessageDto: CreateMessageDto, senderId: string): Promise<Message>;
    findByAd(adId: string, userId: string): Promise<Message[]>;
    findOne(id: string, userId: string): Promise<Message>;
    findOneForAdmin(id: string): Promise<Message>;
    findByUser(userId: string, userRole?: string): Promise<Message[]>;
    markAsRead(id: string, userId: string): Promise<Message>;
    remove(id: string, userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
    findAllWithFilters(filters: {
        page?: number;
        limit?: number;
        senderName?: string;
        receiverName?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        data: Message[];
        total: number;
        page: number;
        limit: number;
    }>;
    findAdminMessages(adminId: string, filters: {
        page?: number;
        limit?: number;
        senderName?: string;
        receiverName?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        data: Message[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByUserId(userId: string, filters?: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: Message[];
        total: number;
        page: number;
        limit: number;
    }>;
}
