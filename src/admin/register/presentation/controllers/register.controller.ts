import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterUserUseCase } from '../../application/use-cases/register.user-case';
import { CreateRegisterDto } from '../../application/dto/create-register.dto';

@Controller()
export class RegisterController {
  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @MessagePattern('register')
  async register(@Payload() payload: CreateRegisterDto) {
    return await this.registerUserUseCase.execute(payload);
  }

  @MessagePattern('auth.register')
  async registerV2(@Payload() payload: CreateRegisterDto) {
    return this.register(payload);
  }
}
