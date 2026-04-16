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
      data: user.data,
      error: null,
    };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  getMe(@Req() req: Request) {
    return {
      success: true,
      user: req.user,
    };
  }

  @Post('refresh')
  async refreshToken(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const token = request.cookies?.token as string;
    const user = await this.authService.refreshToken(token);

    response.cookie('token', user.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      success: true,
      access_token: user.access_token,
      user: user.data.user,
    };
  }

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
