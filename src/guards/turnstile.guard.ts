import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
}

@Injectable()
export class TurnstileGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.body?.['cf-turnstile-token'];

    if (!token || typeof token !== 'string' || token.trim() === '') {
      throw new BadRequestException('Captcha verification required');
    }

    const secret = this.configService.get<string>('TURNSTILE_SECRET_KEY');
    if (!secret) {
      throw new UnauthorizedException('Captcha verification is not available');
    }

    try {
      const body = new URLSearchParams();
      body.append('secret', secret);
      body.append('response', token);

      const { data } = await axios.post<TurnstileVerifyResponse>(TURNSTILE_VERIFY_URL, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
      });

      if (!data.success) {
        throw new UnauthorizedException('Captcha verification failed');
      }

      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException || err instanceof BadRequestException) {
        throw err;
      }
      throw new UnauthorizedException('Captcha verification failed');
    }
  }
}
