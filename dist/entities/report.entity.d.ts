import { User } from './user.entity';
import { Ad } from './ad.entity';
import { Message } from './message.entity';
export declare enum ReportType {
    AD = "ad",
    MESSAGE = "message"
}
export declare enum ReportStatus {
    PENDING = "pending",
    REVIEWED = "reviewed",
    RESOLVED = "resolved",
    DISMISSED = "dismissed"
}
export declare class Report {
    id: string;
    type: ReportType;
    adId: string;
    messageId: string;
    reporterId: string;
    reason: string;
    adminNotes: string;
    status: ReportStatus;
    createdAt: Date;
    updatedAt: Date;
    reporter: User;
    ad: Ad;
    message: Message;
}
