import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailVerificationService } from './email-verification.service';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { Public } from '../../decorators/public.decorator';

@ApiTags('Email Verification')
@Controller('email-verification')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Post('verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email verification code' })
  @ApiResponse({ status: 200, description: 'Code verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    const signupData = await this.emailVerificationService.verifyCode(
      verifyCodeDto.email,
      verifyCodeDto.code,
    );
    return {
      message: 'کد تأیید با موفقیت تأیید شد',
      signupData,
    };
  }

  @Post('resend')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resend verification code to email' })
  @ApiResponse({ status: 200, description: 'Verification code resent successfully' })
  @ApiResponse({ status: 404, description: 'No pending verification found' })
  async resendCode(@Body() resendCodeDto: ResendCodeDto) {
    await this.emailVerificationService.resendVerificationCode(resendCodeDto.email);
    return {
      message: 'کد تأیید مجدداً به ایمیل شما ارسال شد',
      email: resendCodeDto.email,
    };
  }
}

