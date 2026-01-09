import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerification } from '../../entities/email-verification.entity';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

/**
 * Email Verification Service
 * 
 * Handles email verification logic:
 * - Generate 4-digit verification codes
 * - Send verification emails
 * - Verify codes
 */
@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(EmailVerification)
    private emailVerificationRepository: Repository<EmailVerification>,
    private emailService: EmailService,
  ) {}

  /**
   * Generate a random 4-digit code
   */
  private generateCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  /**
   * Send verification code to email
   */
  async sendVerificationCode(
    email: string,
    signupData: CreateUserDto,
  ): Promise<{ code: string; expiresAt: Date }> {
    // Delete any existing unverified codes for this email
    await this.emailVerificationRepository.delete({
      email,
      verified: false,
    });

    // Generate new code
    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 3); // Code expires in 3 minutes

    // Save verification record
    const verification = this.emailVerificationRepository.create({
      email,
      code,
      signupData: JSON.stringify(signupData),
      expiresAt,
      verified: false,
    });

    await this.emailVerificationRepository.save(verification);

    // Send email
    await this.emailService.sendVerificationCode(email, code, signupData.name);

    return { code, expiresAt };
  }

  /**
   * Verify code and return signup data
   */
  async verifyCode(email: string, code: string): Promise<CreateUserDto> {
    const verification = await this.emailVerificationRepository.findOne({
      where: { email, code, verified: false },
      order: { createdAt: 'DESC' },
    });

    if (!verification) {
      throw new BadRequestException('کد تأیید نامعتبر است');
    }

    // Check if code has expired
    if (new Date() > verification.expiresAt) {
      throw new BadRequestException('کد تأیید منقضی شده است');
    }

    // Mark as verified
    verification.verified = true;
    await this.emailVerificationRepository.save(verification);

    // Return signup data
    return JSON.parse(verification.signupData) as CreateUserDto;
  }

  /**
   * Resend verification code for an email
   * Gets the signup data from existing verification record
   */
  async resendVerificationCode(email: string): Promise<{ code: string; expiresAt: Date }> {
    // Find the most recent verification record (even if expired) to get signup data
    const existingVerification = await this.emailVerificationRepository.findOne({
      where: { email, verified: false },
      order: { createdAt: 'DESC' },
    });

    if (!existingVerification) {
      throw new NotFoundException('هیچ درخواست تأیید ایمیل یافت نشد. لطفاً دوباره ثبت نام کنید.');
    }

    // Get signup data from existing verification
    const signupData = JSON.parse(existingVerification.signupData) as CreateUserDto;

    // Resend code using existing signup data
    return this.sendVerificationCode(email, signupData);
  }

  /**
   * Check if email has a pending verification
   */
  async hasPendingVerification(email: string): Promise<boolean> {
    const verification = await this.emailVerificationRepository.findOne({
      where: { email, verified: false },
      order: { createdAt: 'DESC' },
    });

    if (!verification) {
      return false;
    }

    // Check if expired
    if (new Date() > verification.expiresAt) {
      return false;
    }

    return true;
  }
}

