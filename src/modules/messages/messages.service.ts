import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere } from 'typeorm';
import { Message } from '../../entities/message.entity';
import { Ad } from '../../entities/ad.entity';
import { User } from '../../entities/user.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { RoleType } from '../../entities/role.entity';

/**
 * Messages Service
 * 
 * Handles messaging between users:
 * - Send message about an ad
 * - List messages for an ad
 * - Get message by ID
 * - Mark messages as read
 */
@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Ad)
    private adsRepository: Repository<Ad>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Send a message about an ad
   * Receiver is automatically set to the ad owner (for buyers)
   * For ad owners replying, receiver is set to the original message sender
   */
  async create(createMessageDto: CreateMessageDto, senderId: string): Promise<Message> {
    // Verify ad exists
    const ad = await this.adsRepository.findOne({
      where: { id: createMessageDto.adId, deletedAt: null },
      relations: ['user'],
    });

    if (!ad) {
      throw new NotFoundException(`Ad with ID ${createMessageDto.adId} not found`);
    }

    let receiverId: string;

    // If sender is the ad owner, find the other participant in the conversation
    if (ad.userId === senderId) {
      // Find the most recent message for this ad to get the other participant
      const recentMessage = await this.messagesRepository.findOne({
        where: [
          { adId: createMessageDto.adId, senderId, deletedAt: null },
          { adId: createMessageDto.adId, receiverId: senderId, deletedAt: null },
        ],
        order: { createdAt: 'DESC' },
      });

      if (!recentMessage) {
        throw new ForbiddenException('No conversation found to reply to');
      }

      // Determine the receiver: if recent message was sent by ad owner, reply to its receiver
      // Otherwise, reply to the sender of the recent message
      receiverId = recentMessage.senderId === senderId 
        ? recentMessage.receiverId 
        : recentMessage.senderId;
    } else {
      // For buyers, receiver is always the ad owner
      receiverId = ad.userId;
    }

    // Prevent sending message to yourself
    if (receiverId === senderId) {
      throw new ForbiddenException('You cannot send a message to yourself');
    }

    const message = this.messagesRepository.create({
      ...createMessageDto,
      senderId,
      receiverId,
    });

    const savedMessage = await this.messagesRepository.save(message);
    return savedMessage;
  }

  /**
   * Get all messages for an ad
   * Only ad owner and message sender can view messages
   */
  async findByAd(adId: string, userId: string): Promise<Message[]> {
    // Verify ad exists
    const ad = await this.adsRepository.findOne({
      where: { id: adId, deletedAt: null },
    });

    if (!ad) {
      throw new NotFoundException(`Ad with ID ${adId} not found`);
    }

    // Check permissions: user must be ad owner or have sent/received messages
    const messages = await this.messagesRepository.find({
      where: [
        { adId, senderId: userId, deletedAt: null },
        { adId, receiverId: userId, deletedAt: null },
      ],
      relations: ['sender', 'receiver', 'ad'],
      order: { createdAt: 'ASC' }, // Oldest first, newest at bottom
    });
    return messages;
  }

  /**
   * Get message by ID
   * Only sender or receiver can view
   */
  async findOne(id: string, userId: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['sender', 'receiver', 'ad'],
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    // Check permissions
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new ForbiddenException('You do not have permission to view this message');
    }

    return message;
  }

  /**
   * Get message by ID for admin
   * Admin can view any message
   */
  async findOneForAdmin(id: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['sender', 'receiver', 'ad'],
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return message;
  }

  /**
   * Get all messages for current user (inbox)
   * For admins: includes both sent and received messages
   */
  async findByUser(userId: string, userRole?: string): Promise<Message[]> {
    // For admins, include both sent and received messages
    const isAdmin = userRole === RoleType.ADMIN || userRole === RoleType.SUPER_ADMIN;
    const whereConditions: FindOptionsWhere<Message>[] = isAdmin
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

  /**
   * Mark message as read
   */
  async markAsRead(id: string, userId: string): Promise<Message> {
    const message = await this.findOne(id, userId);

    // Only receiver can mark as read
    if (message.receiverId !== userId) {
      throw new ForbiddenException('Only the receiver can mark a message as read');
    }

    message.isRead = true;
    return this.messagesRepository.save(message);
  }

  /**
   * Mark all unread messages for an ad as read
   * Both ad owner and message participants can mark their own messages as read
   */
  async markAllAsReadForAd(adId: string, userId: string): Promise<{ count: number }> {
    // Verify ad exists
    const ad = await this.adsRepository.findOne({
      where: { id: adId, deletedAt: null },
    });

    if (!ad) {
      throw new NotFoundException(`Ad with ID ${adId} not found`);
    }

    // Check if user is ad owner or has messages in this conversation
    const userMessages = await this.messagesRepository.findOne({
      where: [
        { adId, senderId: userId, deletedAt: null },
        { adId, receiverId: userId, deletedAt: null },
      ],
    });

    if (ad.userId !== userId && !userMessages) {
      throw new ForbiddenException('You can only mark messages as read for ads you own or participate in');
    }

    // Update all unread messages for this ad where user is the receiver
    // Use query builder to handle null check properly
    const result = await this.messagesRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('adId = :adId', { adId })
      .andWhere('receiverId = :userId', { userId })
      .andWhere('isRead = :isRead', { isRead: false })
      .andWhere('(deletedAt IS NULL OR deletedAt = :nullValue)', { nullValue: null })
      .execute();

    return { count: result.affected || 0 };
  }

  /**
   * Delete message (soft delete)
   * Only sender or receiver can delete
   */
  async remove(id: string, userId: string): Promise<void> {
    const message = await this.findOne(id, userId);

    // Check permissions: only sender or receiver can delete
    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this message');
    }

    // Soft delete
    message.deletedAt = new Date();
    await this.messagesRepository.save(message);
  }

  /**
   * Get count of unread messages for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.messagesRepository.count({
      where: {
        receiverId: userId,
        isRead: false,
        deletedAt: null,
      },
    });
  }

  /**
   * Get count of unread messages for a specific ad
   * Only counts messages where the user is the receiver (ad owner)
   */
  async getUnreadCountForAd(adId: string, userId: string): Promise<number> {
    // Verify ad exists and user is the owner
    const ad = await this.adsRepository.findOne({
      where: { id: adId, deletedAt: null },
    });

    if (!ad) {
      throw new NotFoundException(`Ad with ID ${adId} not found`);
    }

    // Only ad owner can see unread count for their ad
    if (ad.userId !== userId) {
      throw new ForbiddenException('You can only view unread count for your own ads');
    }

    return this.messagesRepository.count({
      where: {
        adId,
        receiverId: userId,
        isRead: false,
        deletedAt: null,
      },
    });
  }

  /**
   * Get all messages with filters and pagination (for Super Admin)
   * Super Admin can see all messages
   */
  async findAllWithFilters(filters: {
    page?: number;
    limit?: number;
    senderName?: string;
    receiverName?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ data: Message[]; total: number; page: number; limit: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .leftJoinAndSelect('message.ad', 'ad')
      .where('message.deletedAt IS NULL');

    // Filter by sender name
    if (filters.senderName) {
      queryBuilder.andWhere('sender.name ILIKE :senderName', {
        senderName: `%${filters.senderName}%`,
      });
    }

    // Filter by receiver name
    if (filters.receiverName) {
      queryBuilder.andWhere('receiver.name ILIKE :receiverName', {
        receiverName: `%${filters.receiverName}%`,
      });
    }

    // Filter by date range
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

  /**
   * Get admin's messages with filters and pagination
   * Admin can only see their own messages (sent and received)
   */
  async findAdminMessages(
    adminId: string,
    filters: {
      page?: number;
      limit?: number;
      senderName?: string;
      receiverName?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{ data: Message[]; total: number; page: number; limit: number }> {
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

    // Filter by sender name
    if (filters.senderName) {
      queryBuilder.andWhere('sender.name ILIKE :senderName', {
        senderName: `%${filters.senderName}%`,
      });
    }

    // Filter by receiver name
    if (filters.receiverName) {
      queryBuilder.andWhere('receiver.name ILIKE :receiverName', {
        receiverName: `%${filters.receiverName}%`,
      });
    }

    // Filter by date range
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

  /**
   * Get all messages for a specific user (Super Admin only)
   * Returns all messages where the user is sender or receiver
   */
  async findByUserId(
    userId: string,
    filters?: {
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: Message[]; total: number; page: number; limit: number }> {
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
}

