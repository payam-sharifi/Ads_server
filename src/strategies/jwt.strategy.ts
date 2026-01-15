import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../modules/users/users.service';
import { User } from '../entities/user.entity';

/**
 * JWT Strategy for Passport
 * 
 * Validates JWT tokens and extracts user information
 * Token is extracted from Authorization header: "Bearer <token>"
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-super-secret-jwt-key-change-this-in-production',
    });
  }

    async validate(payload: { sub: string; email: string }): Promise<User> {
    const user = await this.usersService.findOneWithRole(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    
    // Check if user is blocked or suspended
    if (user.isBlocked) {
      throw new UnauthorizedException('Account is blocked');
    }
    
    if (user.isSuspended && user.suspendedUntil && user.suspendedUntil > new Date()) {
      throw new UnauthorizedException('Account is suspended');
    }
    
    return user;
  }
}

