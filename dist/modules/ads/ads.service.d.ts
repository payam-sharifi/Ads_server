import { Repository } from 'typeorm';
import { Ad } from '../../entities/ad.entity';
import { User } from '../../entities/user.entity';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { FilterAdsDto } from './dto/filter-ads.dto';
import { ApproveAdDto } from './dto/approve-ad.dto';
import { RejectAdDto } from './dto/reject-ad.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MessagesService } from '../messages/messages.service';
export declare class AdsService {
    private adsRepository;
    private auditLogService;
    private messagesService;
    constructor(adsRepository: Repository<Ad>, auditLogService: AuditLogService, messagesService: MessagesService);
    findAll(filters?: FilterAdsDto, user?: User): Promise<{
        data: Ad[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, incrementViews?: boolean, user?: User): Promise<Ad>;
    create(createAdDto: CreateAdDto, userId: string): Promise<Ad>;
    update(id: string, updateAdDto: UpdateAdDto, user: User): Promise<Ad>;
    approve(id: string, approveAdDto: ApproveAdDto, admin: User): Promise<Ad>;
    reject(id: string, rejectAdDto: RejectAdDto, admin: User): Promise<Ad>;
    remove(id: string, user: User): Promise<void>;
    suspend(id: string, admin: User): Promise<Ad>;
    unsuspend(id: string, admin: User): Promise<Ad>;
    findByUser(userId: string, requestingUser?: User): Promise<Ad[]>;
}
