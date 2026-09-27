import { Inject, Injectable } from '@nestjs/common';
import type { LoginInterfaceRepository } from '../ports/login-repository.interface';
import { UserAuth } from 'src/login/domain/entities/user-auth.entity';
import { LOGIN_REPOSITORY } from 'src/login/domain/constants/injection-tokens';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(LOGIN_REPOSITORY)
    private readonly loginRepository: LoginInterfaceRepository,
  ) {}

  async execute(email: string, password: string): Promise<UserAuth> {
    return this.loginRepository.login(email, password);
  }

  async verifyUserAuthenticate(token: string): Promise<UserAuth> {
    return this.loginRepository.verifyUserAuthenticate(token);
  }
}
