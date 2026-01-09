import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EmailVerification } from '../../entities/email-verification.entity';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { InjectDataSource } from '@nestjs/typeorm';

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
    @InjectDataSource()
    private dataSource: DataSource,
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
    // #region agent log
    try {
      const tableExists = await this.dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'email_verifications'
        );
      `);
      fetch('http://127.0.0.1:7251/ingest/16dff4fb-acde-45fe-9026-2a312fc80629',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email-verification.service.ts:38',message:'Table existence check',data:{tableExists:tableExists[0]?.exists,email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    } catch (err: any) {
      fetch('http://127.0.0.1:7251/ingest/16dff4fb-acde-45fe-9026-2a312fc80629',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email-verification.service.ts:38',message:'Table check error',data:{error:err?.message,email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion agent log
    
    // #region agent log
    try {
      const executedMigrations = await this.dataSource.query(`
        SELECT * FROM migrations ORDER BY timestamp DESC LIMIT 5;
      `);
      fetch('http://127.0.0.1:7251/ingest/16dff4fb-acde-45fe-9026-2a312fc80629',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email-verification.service.ts:48',message:'Executed migrations check',data:{executedMigrations},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    } catch (err: any) {
      fetch('http://127.0.0.1:7251/ingest/16dff4fb-acde-45fe-9026-2a312fc80629',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email-verification.service.ts:48',message:'Migration table check error',data:{error:err?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion agent log

    // Delete any existing unverified codes for this email
    // #region agent log
    fetch('http://127.0.0.1:7251/ingest/16dff4fb-acde-45fe-9026-2a312fc80629',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'email-verification.service.ts:40',message:'Before delete operation',data:{email,repositoryReady:!!this.emailVerificationRepository},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion agent log
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

