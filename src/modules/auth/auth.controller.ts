import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { VerifyCodeDto } from '../email-verification/dto/verify-code.dto';
import { Public } from '../../decorators/public.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { User } from '../../entities/user.entity';

/**
 * Auth Controller
 * 
 * Endpoints:
 * - POST /api/auth/signup - Register a new user
 * - POST /api/auth/login - Login with email and password
 * 
 * These endpoints are public (no authentication required).
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * User Signup - sends verification code to email
   * 
   * Request:
   *   POST /api/auth/signup
   *   Body: {
   *     "name": "John Doe",
   *     "email": "john@example.com",
   *     "phone": "+49 123 456789",
   *     "password": "securePassword123"
   *   }
   * 
   * Response:
   *   {
   *     "message": "کد تأیید به ایمیل شما ارسال شد",
   *     "email": "john@example.com"
   *   }
   * 
   * Errors:
   *   - 409: Email already exists
   *   - 400: Validation error
   */
  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start user registration - sends verification code' })
  @ApiResponse({ status: 200, description: 'Verification code sent successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  /**
   * Complete Signup - verify code and create user
   * 
   * Request:
   *   POST /api/auth/complete-signup
   *   Body: {
   *     "email": "john@example.com",
   *     "code": "1234"
   *   }
   * 
   * Response:
   *   {
   *     "user": { ... },
   *     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
   *     "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *   }
   * 
   * Errors:
   *   - 400: Invalid or expired code
   */
  @Post('complete-signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Complete user registration after email verification' })
  @ApiResponse({ status: 201, description: 'User successfully registered and logged in' })
  @ApiResponse({ status: 400, description: 'Invalid or expired verification code' })
  async completeSignup(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.completeSignup(verifyCodeDto.email, verifyCodeDto.code);
  }

  /**
   * User Login
   * 
   * Request:
   *   POST /api/auth/login
   *   Body: {
   *     "email": "john@example.com",
   *     "password": "securePassword123"
   *   }
   * 
   * Response:
   *   {
   *     "user": {
   *       "id": "uuid",
   *       "name": "John Doe",
   *       "email": "john@example.com",
   *       "phone": "+49 123 456789",
   *       "role": "user",
   *       "createdAt": "2024-01-01T00:00:00.000Z",
   *       "updatedAt": "2024-01-01T00:00:00.000Z"
   *     },
   *     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *   }
   * 
   * Errors:
   *   - 401: Invalid email or password
   *   - 400: Validation error
   */
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout - invalidate refresh token' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@CurrentUser() user: User) {
    return this.authService.logout(user.id);
  }
}

