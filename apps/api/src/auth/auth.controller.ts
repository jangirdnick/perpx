import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { RegisterUserDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() registerDto: RegisterUserDto) {
    return this.authService.registerUser(registerDto);
  }

  @Post('login')
  async loginUser(
    @Body() loginDto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.loginUser(loginDto);
    response.cookie('token', user.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      ...user,
      refresh_token: undefined,
      data: {},
      error: null,
    };
  }

  @Get('me')
  async getMe() {}

  @Post('refresh')
  refreshToken() {}

  @Post('logout')
  logoutUser() {}

  @Post('logout-all')
  logoutAllDevices() {}

  @Post('send/verification-email')
  async sendVerificationEmail(@Body() loginDto: LoginUserDto) {
    return await this.authService.sendVerificationEmail(loginDto);
  }

  @Post('verify-email')
  async verifyEmail(@Query('token') token: string) {
    if (!token) throw new BadRequestException('Wrong request');
    return await this.authService.verifyEmail(token);
  }
}
