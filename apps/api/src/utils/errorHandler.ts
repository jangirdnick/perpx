import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export const handleServiceError = (
  error: any,
  defaultMsg = 'Operation failed',
) => {
  if (error instanceof BadRequestException) throw error;
  if (error instanceof UnauthorizedException) throw error;
  if (error instanceof ForbiddenException) throw error;
  if (error instanceof NotFoundException) throw error;
  throw new BadRequestException(defaultMsg);
};
