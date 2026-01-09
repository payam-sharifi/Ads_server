import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerification } from '../../entities/email-verification.entity';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationController } from './email-verification.controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailVerification]),
    EmailModule,
  ],
  controllers: [EmailVerificationController],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}

