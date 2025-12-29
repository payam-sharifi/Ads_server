import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from '../../entities/user.entity';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    create(createMessageDto: CreateMessageDto, user: User): Promise<import("../../entities/message.entity").Message>;
    findByAd(adId: string, user: User): Promise<import("../../entities/message.entity").Message[]>;
    findMyInbox(user: User): Promise<import("../../entities/message.entity").Message[]>;
    getUnreadCount(user: User): Promise<{
        count: number;
    }>;
    markAsRead(id: string, user: User): Promise<import("../../entities/message.entity").Message>;
    remove(id: string, user: User): Promise<{
        message: string;
    }>;
    findAllForSuperAdmin(page?: number, limit?: number, senderName?: string, receiverName?: string, startDate?: string, endDate?: string): Promise<{
        data: import("../../entities/message.entity").Message[];
        total: number;
        page: number;
        limit: number;
    }>;
    findAdminMessages(user: User, page?: number, limit?: number, senderName?: string, receiverName?: string, startDate?: string, endDate?: string): Promise<{
        data: import("../../entities/message.entity").Message[];
        total: number;
        page: number;
        limit: number;
    }>;
    findByUserId(userId: string, page?: number, limit?: number): Promise<{
        data: import("../../entities/message.entity").Message[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOneForAdmin(id: string): Promise<import("../../entities/message.entity").Message>;
    findOne(id: string, user: User): Promise<import("../../entities/message.entity").Message>;
}
