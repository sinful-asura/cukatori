import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthCookies } from './auth.cookies.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { AuthSessionService } from './auth-session.service.js';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-cukatori-secret',
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN ?? '1d') as `${number}${'d' | 'h' | 'm'}` },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthSessionService, AuthCookies, AuthGuard],
  exports: [AuthService, AuthGuard, AuthSessionService, AuthCookies],
})
export class AuthModule {}
