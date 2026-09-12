import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthCookies, REFRESH_COOKIE } from './auth.cookies.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { GoogleAuthRequest, LoginRequest, RegisterRequest } from './auth.dto.js';
import { CurrentUser } from './current-user.decorator.js';
import type { User } from '../users/user.entity.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cookies: AuthCookies,
  ) {}

  @Get('config')
  config() {
    return this.auth.config();
  }

  @Post('register')
  async register(
    @Body() body: RegisterRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const issued = await this.auth.register(
      body.email,
      body.password,
      body.displayName ?? body.email.split('@')[0],
    );
    this.cookies.issue(res, issued.accessToken, issued.refreshToken);
    return { user: issued.user };
  }

  @Post('login')
  async login(@Body() body: LoginRequest, @Res({ passthrough: true }) res: Response) {
    const issued = await this.auth.login(body.email, body.password);
    this.cookies.issue(res, issued.accessToken, issued.refreshToken);
    return { user: issued.user };
  }

  @Post('google')
  async google(@Body() body: GoogleAuthRequest, @Res({ passthrough: true }) res: Response) {
    const issued = await this.auth.googleSignIn(body.credential);
    this.cookies.issue(res, issued.accessToken, issued.refreshToken);
    return { user: issued.user };
  }

  /** Public: the access cookie has usually expired by the time the client refreshes. */
  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const issued = await this.auth.refresh(req.cookies?.[REFRESH_COOKIE] as string | undefined);
    this.cookies.issue(res, issued.accessToken, issued.refreshToken);
    return { user: issued.user };
  }

  /** Public so a client signed out by expiry can still discard the server session. */
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req.cookies?.[REFRESH_COOKIE] as string | undefined);
    this.cookies.clear(res);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: User) {
    return { user: this.auth.toPublic(user) };
  }
}
