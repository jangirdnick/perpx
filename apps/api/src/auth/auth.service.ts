import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterUserDto } from './dto/register.dto';
import { BcryptUtil } from '../utils/bcrypt.util';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerUser(registerDto: RegisterUserDto) {
    const existUser = await this.userService.findByEmailOrUsername(
      registerDto.email,
      registerDto.username,
    );
    if (existUser) throw new BadRequestException('User is allready existe');

    const hashPassword = await BcryptUtil.hash(registerDto.password);
    const createDto = {
      ...registerDto,
      password: hashPassword,
    };

    const user = await this.userService.createUser(createDto);
    if (!user) throw new BadRequestException('User create failed');

    const emailTokenData = { id: user.id, email: user.email };
    const emailToken: string = this.jwtService.sign(emailTokenData);

    const sendMail = await this.emailService.sendVerificationEmail(
      user.email,
      emailToken,
    );
    if (!sendMail.id)
      throw new BadRequestException('Verifaction email sending failed');

    return {
      success: true,
      mesage: `${user.fullname} Register Successfully. Verify-Email Addresh`,
    };
  }
}
