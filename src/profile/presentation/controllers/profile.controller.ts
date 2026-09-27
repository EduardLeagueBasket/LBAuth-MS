import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ProfileUseCase } from '../../application/use-cases/profile.use-case';

@Controller()
export class ProfileController {
  constructor(private readonly profileUseCase: ProfileUseCase) {}

  @MessagePattern('profiles')
  async getProfile() {
    return this.profileUseCase.execute();
  }

  @MessagePattern('auth.profiles')
  async getProfileV2() {
    return this.getProfile();
  }

  @MessagePattern('profile-generate')
  async generateProfile() {
    return this.profileUseCase.generateProfile();
  }

  @MessagePattern('auth.profile-generate')
  async generateProfileV2() {
    return this.generateProfile();
  }
}
