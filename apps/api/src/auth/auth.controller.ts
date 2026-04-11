import { Controller, Get, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('register')
  registerUser() {}

  @Post('login')
  loginUser() {}

  @Get('me')
  getMe() {}

  @Post('refresh')
  refreshToken() {}

  @Post('logout')
  logoutUser() {}

  @Post('logout-all')
  logoutAllDevices() {}

  @Post('send/verification-email')
  sendVerificationEmail() {}

  @Post('verify-email')
  verifyEmail() {}
}
