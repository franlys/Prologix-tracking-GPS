import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'prologix_gps_jwt_secret_change_this_in_production_2025',
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    // ALWAYS use the current role from the database, not from the token
    // This ensures that role changes take effect immediately
    console.log('🔐 JWT Strategy - User from DB:', {
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenRole: payload.role
    });

    return {
      userId: payload.sub,
      email: user.email,
      role: user.role, // ✅ Get role from DB, not from token
      subscriptionPlan: user.subscriptionPlan,
    };
  }
}
