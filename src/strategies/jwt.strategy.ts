import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
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
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
    });
  }

  async validate(payload: { sub: string; email: string }): Promise<User> {
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/8e3d4fb4-043c-450e-b118-fed88d4cad9f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jwt.strategy.ts:validate',message:'JWT validation started',data:{payloadSub:payload.sub,payloadEmail:payload.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    try {
      const user = await this.usersService.findOneWithRole(payload.sub);
      
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/8e3d4fb4-043c-450e-b118-fed88d4cad9f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jwt.strategy.ts:validate',message:'User found',data:{userId:user?.id,userEmail:user?.email,isBlocked:user?.isBlocked,isSuspended:user?.isSuspended},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      if (!user) {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/8e3d4fb4-043c-450e-b118-fed88d4cad9f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jwt.strategy.ts:validate',message:'User not found - throwing UnauthorizedException',data:{payloadSub:payload.sub},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        throw new UnauthorizedException();
      }
      
      // Check if user is blocked or suspended
      if (user.isBlocked) {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/8e3d4fb4-043c-450e-b118-fed88d4cad9f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jwt.strategy.ts:validate',message:'User is blocked',data:{userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        throw new UnauthorizedException('Account is blocked');
      }
      
      if (user.isSuspended && user.suspendedUntil && user.suspendedUntil > new Date()) {
        // #region agent log
        fetch('http://127.0.0.1:7245/ingest/8e3d4fb4-043c-450e-b118-fed88d4cad9f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jwt.strategy.ts:validate',message:'User is suspended',data:{userId:user.id,suspendedUntil:user.suspendedUntil},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        throw new UnauthorizedException('Account is suspended');
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/8e3d4fb4-043c-450e-b118-fed88d4cad9f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jwt.strategy.ts:validate',message:'JWT validation successful',data:{userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      return user;
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7245/ingest/8e3d4fb4-043c-450e-b118-fed88d4cad9f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'jwt.strategy.ts:validate',message:'Error in JWT validation',data:{errorMessage:error?.message,errorName:error?.constructor?.name,payloadSub:payload.sub},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      throw error;
    }
  }
}

