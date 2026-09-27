import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginDto } from '../../application/dto/login.dto';
import { LoginUseCase } from '../../application/use-cases/login.use-case';

@Controller()
export class LoginController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @MessagePattern('login')
  async login(@Payload() loginDto: LoginDto) {
    return this.loginUseCase.execute(loginDto.email, loginDto.password);
  }

  @MessagePattern('auth.login')
  async loginV2(@Payload() loginDto: LoginDto) {
    return this.login(loginDto);
  }

  @MessagePattern('user.authenticate')
  async verifyUserAuthenticate(@Payload() token: string) {
    return await this.loginUseCase.verifyUserAuthenticate(token);
  }

  @MessagePattern('auth.user.authenticate')
  async verifyUserAuthenticateV2(@Payload() token: string) {
    return this.verifyUserAuthenticate(token);
  }
}
