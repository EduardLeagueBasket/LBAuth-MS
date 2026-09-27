import { Inject, Injectable } from '@nestjs/common';
import type { ProfileInterfaceRepository } from '../ports/profile-repository.interface';
import { PROFILE_REPOSITORY } from '../../domain/constans/injection-tokens';
import { Profile } from '../../domain/entities/profile.intity';

@Injectable()
export class ProfileUseCase {
  constructor(
    @Inject(PROFILE_REPOSITORY)
    private readonly profileRepository: ProfileInterfaceRepository,
  ) {}

  async execute(): Promise<Profile[]> {
    return this.profileRepository.getListProfiles();
  }

  async generateProfile(): Promise<Profile[]> {
    return this.profileRepository.generateProfile();
  }
}
