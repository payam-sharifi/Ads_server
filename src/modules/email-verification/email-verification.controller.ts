import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailVerificationService } from './email-verification.service';
import { VerifyCodeDto } from './dto/verify-code.dto';
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
}

