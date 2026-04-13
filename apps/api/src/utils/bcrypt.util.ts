import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS!);

export class BcryptUtil {
  static async hash(password: string): Promise<string> {
    if (!password || typeof password !== 'string') {
      throw new BadRequestException('Invalid password');
    }

    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  static async compair(plain: string, hash: string): Promise<boolean> {
    if (
      !plain ||
      !hash ||
      typeof plain !== 'string' ||
      typeof hash !== 'string'
    ) {
      throw new BadRequestException('Invalid compair password');
    }

    return bcrypt.compare(plain, hash);
  }
}
