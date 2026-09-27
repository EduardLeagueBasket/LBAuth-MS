import { Module } from '@nestjs/common';
//import { RegisterService } from '../register.service';
import { RegisterController } from './controllers/register.controller';
//import { PrismaService } from 'src/prisma/prisma.service';
import { REGISTER_REPOSITORY } from '../domain/constats/injection-tokens';
import { RegisterDataSource } from '../infrastructure/data-sources/register.data-source';
import { RegisterUserUseCase } from '../application/use-cases/register.user-case';
import { NatsModule } from 'src/nats/nats.module';

@Module({
  controllers: [RegisterController],
  providers: [
    //PrismaService,
    {
      provide: REGISTER_REPOSITORY,
      useClass: RegisterDataSource,
    },
    RegisterUserUseCase,
  ],
  imports: [NatsModule],
})
export class RegisterModule {}
