import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegisterUserDto } from './dto/register.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() registerDto: RegisterUserDto) {
    return await this.authService.registerUser(registerDto);
  }

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
