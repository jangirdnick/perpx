import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterUserDto } from './dto/register.dto';
import { BcryptUtil } from '../utils/bcrypt.util';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { JWTCookiePayload, JwtQureyPayload } from './types/jwt.type';
import { handleServiceError } from '../utils/errorHandler';
import { JWTUser } from '../user/types/user.type';
import type {
  AuthRegisterResponse,
  AuthSendVerificationEmailResponse,
  AuthVerifyEmailResponse,
} from '@perpx/shared';
import { NewVerifyEmailDto } from './dto/newverifyemail.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private generateTokens(user: JWTUser, deviceId: string) {
    const accessPayload = { sub: user.id, ...user };
    const refreshPayload = { sub: user.id, device: deviceId };

    const access_token = this.jwtService.sign(accessPayload, {
      expiresIn: '15m',
    });
    const refresh_token = this.jwtService.sign(refreshPayload, {
      expiresIn: '7d',
    });
    return { access_token, refresh_token };
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token) as string | object;
    } catch (err) {
      return handleServiceError(err, 'Failed to verify token');
    }
  }

  async registerUser(
    registerDto: RegisterUserDto,
  ): Promise<AuthRegisterResponse> {
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
      const emailTokenData = { sub: user.id, email: user.email };
      const emailToken = this.jwtService.sign(emailTokenData, {
        expiresIn: '1d',
      });

      await this.emailService.sendVerificationEmail(user.email, emailToken);

      return {
        success: true,
        message: `${user.fullname} registered successfully. Please verify your email.`,
        data: {},
      };
    } catch (error) {
      return handleServiceError(
        error,
        'Registration service failed. Please try again.',
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

      const deviceId = uuidv4();
      const token = this.generateTokens(userWithoutPassword, deviceId);
      if (!token)
        throw new BadRequestException(
          'Token generation failed. Please try again.',
        );

      const hashRefreshToken = await BcryptUtil.hash(token.refresh_token);
      await this.prisma.refreshToken.create({
        data: {
          hashedToken: hashRefreshToken,
          deviceId,
          userId: existUser.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      return {
        success: true,
        message: '🎉 Login successfully.',
        data: {
          user: userWithoutPassword,
          access_token: token.access_token,
          refresh_token: token.refresh_token,
        },
      };
    } catch (error) {
      return handleServiceError(
        error,
        'Login service failed. Please try again.',
      );
    }
  }

  async sendVerificationEmail(
    newVerifyEmailDto: NewVerifyEmailDto,
  ): Promise<AuthVerifyEmailResponse> {
    try {
      const existUser = await this.userService.findByEmail(
        newVerifyEmailDto.email,
      );
      if (!existUser)
        throw new NotFoundException('User not found. Check all credential.');

      if (existUser.emailVerified)
        throw new BadRequestException(
          `${existUser.fullname}  email allredy verified.`,
        );

      const emailTokenData = { sub: existUser.id, email: existUser.email };
      const emailToken = this.jwtService.sign(emailTokenData, {
        expiresIn: '1d',
      });

      await this.emailService.sendVerificationEmail(
        existUser.email,
        emailToken,
      );

      return {
        success: true,
        message: `${existUser.fullname} verification email sent. Please verify your email.`,
        data: {},
      };
    } catch (error) {
      return handleServiceError(
        error,
        'Sending new verify email service failed. Please try again.',
      );
    }
  }

  async verifyEmail(token: string): Promise<AuthSendVerificationEmailResponse> {
    try {
      const decodedToken = this.jwtService.verify<JwtQureyPayload>(token);
      if (!decodedToken) {
        throw new BadRequestException('Invalid verification token');
      }

      const user = await this.prisma.user.findFirst({
        where: { id: decodedToken.sub, email: decodedToken.email },
      });

      if (!user) {
        throw new BadRequestException('Forbidden request');
      }

      if (user.emailVerified) {
        throw new BadRequestException('Email already verified');
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
        select: {
          fullname: true,
          username: true,
          email: true,
        },
      });

      return {
        success: true,
        message: `${updatedUser.fullname} email verified successfully 🎉`,
        data: {},
      };
    } catch (error) {
      return handleServiceError(
        error,
        'Verification email service failed. Please try again.',
      );
    }
  }

  async refreshToken(token: string) {
    try {
      const decodedToken = this.jwtService.verify<JWTCookiePayload>(token);
      if (!decodedToken) throw new UnauthorizedException('Invalid token');

      const dbToken = await this.prisma.refreshToken.findFirst({
        where: { userId: decodedToken.sub, deviceId: decodedToken.device },
        select: {
          id: true,
          deviceId: true,
          hashedToken: true,
          expiresAt: true,
          user: {
            select: {
              id: true,
              fullname: true,
              username: true,
              avatar: true,
              email: true,
              emailVerified: true,
              role: true,
              subscription: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });
      if (!dbToken || dbToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Token expired');
      }
      const decodedDBToken = await BcryptUtil.compair(
        token,
        dbToken.hashedToken,
      );
      if (!decodedDBToken) throw new ForbiddenException('Invalid request');

      await this.prisma.refreshToken.delete({ where: { id: dbToken.id } });

      const newToken = this.generateTokens(dbToken.user, dbToken.deviceId!);
      if (!newToken)
        throw new BadRequestException(
          'Token generation failed. Please try again.',
        );

      const hashedToken = await BcryptUtil.hash(newToken.refresh_token);
      await this.prisma.refreshToken.create({
        data: {
          hashedToken,
          deviceId: dbToken.deviceId,
          userId: dbToken.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      return {
        data: {
          user: dbToken.user,
          access_token: newToken.access_token,
          refresh_token: newToken.refresh_token,
        },
      };
    } catch (error) {
      return handleServiceError(error, 'Refresh token service failed.');
    }
  }

  async logoutUser(token: string) {
    try {
      const decodedToken = this.jwtService.verify<JWTCookiePayload>(token);
      if (!decodedToken) throw new UnauthorizedException('Invalid token');

      const dbToken = await this.prisma.refreshToken.findFirst({
        where: {
          OR: [{ userId: decodedToken.sub }, { deviceId: decodedToken.device }],
        },
        select: {
          id: true,
          hashedToken: true,
          deviceId: true,
          expiresAt: true,
        },
      });

      if (!dbToken || dbToken.expiresAt < new Date())
        throw new UnauthorizedException('Token expire');

      const decodedDBToken = await BcryptUtil.compair(
        token,
        dbToken.hashedToken,
      );
      if (!decodedDBToken) throw new ForbiddenException('Invalid access');

      await this.prisma.refreshToken.deleteMany({
        where: {
          userId: decodedToken.sub,
          deviceId: decodedToken.device,
        },
      });

      return {
        success: true,
        message: 'Logout successfully.',
        data: {},
      };
    } catch (error) {
      return handleServiceError(
        error,
        'Logout user service failed. Please try again.',
      );
    }
  }

  async logoutAllDevices(token: string) {
    try {
      const decodedToken = this.jwtService.verify<JWTCookiePayload>(token);
      if (!decodedToken) throw new UnauthorizedException('Invalid token');

      const dbToken = await this.prisma.refreshToken.findFirst({
        where: {
          OR: [{ userId: decodedToken.sub }, { deviceId: decodedToken.device }],
        },
        select: {
          id: true,
          hashedToken: true,
          deviceId: true,
          expiresAt: true,
        },
      });

      if (!dbToken || dbToken.expiresAt < new Date())
        throw new UnauthorizedException('Token expire');

      const decodedDBToken = await BcryptUtil.compair(
        token,
        dbToken.hashedToken,
      );
      if (!decodedDBToken) throw new ForbiddenException('Invalid exces');

      await this.prisma.refreshToken.deleteMany({
        where: {
          userId: decodedToken.sub,
          deviceId: decodedToken.device,
        },
      });

      return true;
    } catch (error) {
      return handleServiceError(
        error,
        'Logout all devices service failed. Please try again.',
      );
    }
  }
}
