import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterUserDto } from './dto/register.dto';
import { BcryptUtil } from '../utils/bcrypt.util';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(registerDto: RegisterUserDto) {
    // 1. Validation
    const existUser = await this.userService.findByEmailOrUsername(
      registerDto.email,
      registerDto.username,
    );
    if (existUser) {
      throw new BadRequestException('User already exists');
    }

    // 2. Critical operations - try-catch
    try {
      const hashPassword = await BcryptUtil.hash(registerDto.password);
      const createDto = { ...registerDto, password: hashPassword };
      const user = await this.userService.createUser(createDto);

      if (!user) {
        throw new BadRequestException('User creation failed');
      }

      // Email verification
      const emailTokenData = { id: user.id, email: user.email };
      const emailToken = this.jwtService.sign(emailTokenData, {
        expiresIn: '15m',
      });

      await this.emailService.sendVerificationEmail(user.email, emailToken);

      return {
        success: true,
        message: `${user.fullname} registered successfully. Please verify your email.`,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof BadRequestException
          ? error.message
          : 'Registration failed. Please try again.',
      );
    }
  }

  async loginUser(loginDto: LoginUserDto) {
    try {
      // validation
      const existUser = await this.userService.findByEmail(loginDto.email);
      if (!existUser) {
        throw new BadRequestException('Invalid email or password');
      }

      if (!existUser.emailVerified) {
        throw new BadRequestException('Please verify your email first');
      }

      const { password, ...userWithoutPassword } = existUser;

      // Compair password
      const isPasswordValid = await BcryptUtil.compair(
        loginDto.password,
        password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid email or password');
      }

      // Creating tokens
      const payload = {
        sub: existUser.id,
        fullname: existUser.fullname,
        username: existUser.username,
        email: existUser.email,
      };
      const access_token = this.jwtService.sign(payload, {
        expiresIn: '15m',
      });

      const refresh_token = this.jwtService.sign(
        { sub: existUser.id },
        { expiresIn: '7d' },
      );

      // Refresh token save database
      await this.prisma.refreshToken.create({
        data: {
          token: refresh_token,
          userId: existUser.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      return {
        success: true,
        message: 'Login successfully',
        data: {
          user: userWithoutPassword,
        },
        access_token,
        refresh_token,
      };
    } catch (error) {
      throw new BadRequestException(
        error instanceof BadRequestException
          ? error.message
          : 'Login failed. Please try again.',
      );
    }
  }
}
