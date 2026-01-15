import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../../entities/user.entity';
import { EmailVerificationService } from '../email-verification/email-verification.service';

/**
 * Auth Service
 * 
 * Handles authentication logic:
 * - User signup
 * - User login (email + password validation)
 * - JWT token generation
 */
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailVerificationService: EmailVerificationService,
  ) {}

  /**
   * Validate user credentials
   * 
   * @param email - User email
   * @param password - Plain text password
   * @returns User if credentials are valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  /**
   * User login
   * 
   * @param loginDto - Login credentials
   * @returns User object, JWT access token, and refresh token
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is blocked or suspended
    if (user.isBlocked) {
      throw new UnauthorizedException('Account is blocked');
    }

    if (user.isSuspended && user.suspendedUntil && user.suspendedUntil > new Date()) {
      throw new UnauthorizedException('Account is suspended');
    }

    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    // Save refresh token to user
    await this.usersService.updateRefreshToken(user.id, refreshToken);

    const { password, refreshToken: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOne(payload.sub);

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const newPayload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
      });

      return {
        access_token: accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout - invalidate refresh token
   */
  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  /**
   * User signup - sends verification code to email
   * 
   * @param createUserDto - User registration data
   * @returns Success message
   */
  async signup(createUserDto: CreateUserDto) {
    // Check if user with email already exists
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Send verification code
    await this.emailVerificationService.sendVerificationCode(
      createUserDto.email,
      createUserDto,
    );

    return {
      message: 'کد تأیید به ایمیل شما ارسال شد',
      email: createUserDto.email,
    };
  }

  /**
   * Complete signup after email verification
   * 
   * @param email - User email
   * @param code - Verification code
   * @returns User object, JWT access token, and refresh token
   */
  async completeSignup(email: string, code: string) {
    // Verify code and get signup data
    const signupData = await this.emailVerificationService.verifyCode(email, code);

    // Create user
    const user = await this.usersService.create(signupData);

    // Generate tokens
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    // Save refresh token to user
    await this.usersService.updateRefreshToken(user.id, refreshToken);

    return {
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}

