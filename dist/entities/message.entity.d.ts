import { User } from './user.entity';
import { Ad } from './ad.entity';
export declare class Message {
    id: string;
    senderId: string;
    receiverId: string;
    adId: string;
    messageText: string;
    isRead: boolean;
    createdAt: Date;
    deletedAt: Date;
    sender: User;
    receiver: User;
    ad: Ad;
}
