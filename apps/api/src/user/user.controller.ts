import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { UpdateUserResponse } from '@perpx/shared/types/user.type';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('me')
  @UseGuards(AuthGuard)
  async updateMe(
    @Req() request: Request,
    @Body() updateDto: UpdateUserDto,
  ): Promise<UpdateUserResponse> {
    const userId = request.user?.id;
    if (!userId) {
      throw new Error('User not found in request');
    }

    const updatedUser = await this.userService.updateUser(userId, updateDto);

    return {
      success: true,
      message: 'User profile updated successfully',
      data: {
        user: updatedUser,
      },
    };
  }

  @Delete('me')
  @UseGuards(AuthGuard)
  async deleteMe(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const userId = request.user?.id;
    if (!userId) {
      throw new BadRequestException('User not found in request');
    }

    await this.userService.deleteUser(userId);
    response.clearCookie('token');

    return {
      success: true,
      message: 'Account deleted successfully',
      data: {},
    };
  }
}
