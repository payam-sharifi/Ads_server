import { IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a message
 * 
 * Example request body:
 * {
 *   "adId": "uuid",
 *   "messageText": "Is this item still available?"
 * }
 * 
 * Note: receiverId is automatically determined from the ad owner
 */
export class CreateMessageDto {
  @ApiProperty({ example: 'uuid', description: 'Ad ID that the message is about' })
  @IsUUID()
  adId: string;

  @ApiProperty({ example: 'Is this item still available?', description: 'Message text' })
  @IsString()
  @MinLength(1)
  messageText: string;
}

