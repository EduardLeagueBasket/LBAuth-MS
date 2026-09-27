import { Module } from '@nestjs/common';
import { UpdatePasswordController } from './controllers/update-password.controller';
import { UpdatePasswordDataSource } from '../infrastructure/data-sources/update-password.data-source';
import { UPDATE_PASSWORD_REPOSITORY } from '../domain/constants/injection-tokens';
import { UpdatePasswordUseCase } from '../application/use-cases/update-password.use-case';

@Module({
  controllers: [UpdatePasswordController],
  providers: [
    UpdatePasswordUseCase,
    {
      provide: UPDATE_PASSWORD_REPOSITORY,
      useClass: UpdatePasswordDataSource,
    },
  ],
})
export class UpdatePasswordModule {}
