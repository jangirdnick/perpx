import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export const handleServiceError = (
  error: any,
  defaultMsg = 'Operation failed',
) => {
  console.error(`❌ [Service Error]:`, error);
  if (error instanceof BadRequestException) throw error;
  if (error instanceof UnauthorizedException) throw error;
  if (error instanceof ForbiddenException) throw error;
  if (error instanceof NotFoundException) throw error;
  if (error instanceof HttpException) {
    throw error;
  }
  throw new InternalServerErrorException(defaultMsg);
};
