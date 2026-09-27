import { BadRequestException } from '@nestjs/common';

export class UpdatePasswordException extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}
