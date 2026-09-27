import { Module } from '@nestjs/common';
import { ProfileController } from './controllers/profile.controller';
import { ProfileUseCase } from '../application/use-cases/profile.use-case';
import { ProfileDataSource } from '../infrastructure/data-sources/profile.data-source';
import { PROFILE_REPOSITORY } from '../domain/constans/injection-tokens';

@Module({
  controllers: [ProfileController],
  providers: [
    ProfileUseCase,
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfileDataSource,
    },
  ],
})
export class ProfileModule {}
