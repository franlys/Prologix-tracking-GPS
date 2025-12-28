import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = (): JwtModuleOptions => ({
  secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as any,
});
