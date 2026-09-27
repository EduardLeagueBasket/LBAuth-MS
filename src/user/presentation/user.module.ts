import { Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserUseCase } from '../application/use-cases/user.use-case';
import { USER_REPOSITORY } from '../domain/constants/injection-tokens';
import { UserDataSource } from '../infrastructure/data-sources/user.data-source';
import { NatsModule } from '../../nats/nats.module';
import { MailModule } from '../../mail/mail.module';

@Module({
  controllers: [UserController],
  providers: [
    UserUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: UserDataSource,
    },
  ],
  imports: [NatsModule, MailModule],
})
export class UserModule {}
