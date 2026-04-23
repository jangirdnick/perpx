import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { RegisterUserDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login.dto';
import { AuthGuard } from './guards/auth.guard';
import {
  AuthGetMeResponse,
  AuthLoginResponse,
  AuthRefreshTokenResponse,
  AuthResponse,
} from '@perpx/shared';
import { NewVerifyEmailDto } from './dto/newverifyemail.dto';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  registerUser(@Body() registerDto: RegisterUserDto) {
    return this.authService.registerUser(registerDto);
  }

  @Post('login')
  async loginUser(
    @Body() loginDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthLoginResponse> {
    const result = await this.authService.loginUser(loginDto);
    if (!result) throw new BadRequestException('Login service failed.');
    const { data, ...rest } = result;
    const { refresh_token, ...safeData } = data;

    response.cookie('token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      ...rest,
      success: true,
      data: safeData,
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Req() request: Request): Promise<AuthGetMeResponse> {
    if (!request.user) {
      throw new BadRequestException('Bad request');
    }

    return Promise.resolve({
      success: true,
      message: 'User info fetch successful.',
      data: {
        user: request.user,
      },
    });
  }

  @Post('refresh')
  async refreshToken(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ): Promise<AuthRefreshTokenResponse> {
    const token = request.cookies?.token as string;
    if (!token)
      throw new BadRequestException('Wrong request token is require.');
    const user = await this.authService.refreshToken(token);
    if (!user) throw new BadRequestException('Refresh token service failed.');
    response.cookie('token', user.data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      success: true,
      message: 'Tokrn refresh successful.',
      data: {
        access_token: user.data.access_token,
      },
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logoutUser(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const token = request.cookies?.token as string;
    await this.authService.logoutUser(token);
    response.clearCookie('token');
    return {
      success: true,
      message: 'Logout successfully.',
      data: {},
    };
  }

  @Post('logout-all')
  @UseGuards(AuthGuard)
  async logoutAllDevices(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    const token = request.cookies?.token as string;
    await this.authService.logoutAllDevices(token);
    response.clearCookie('token');
    return {
      success: true,
      message: 'Logged out all devices successful.',
      data: {},
    };
  }

  @Post('send/verification-email')
  async sendVerificationEmail(@Body() newVerifyEmailDto: NewVerifyEmailDto) {
    return await this.authService.sendVerificationEmail(newVerifyEmailDto);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() response: Response) {
    try {
      const result = await this.authService.verifyEmail(token);

      if (result.success) {
        return response.redirect(
          `${process.env.FRONTEND_URL}/account/login?verified=true&message=${encodeURIComponent(result.message)}`,
        );
      }

      return response.redirect(
        `${process.env.FRONTEND_URL}/account/login?verified=false&message=${encodeURIComponent(result.message)}`,
      );
    } catch {
      return response.redirect(
        `${process.env.FRONTEND_URL}/account/login?verified=false&message=${encodeURIComponent('Email verification failed')}`,
      );
    }
  }
}
