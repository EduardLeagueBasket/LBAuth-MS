import { Module } from '@nestjs/common';
//import { LoginService } from '../login.service';
import { LoginController } from './controllers/login.controller';
import { LoginDataSource } from '../infrastructure/data-sources/login.data-source';
import { LOGIN_REPOSITORY } from '../domain/constants/injection-tokens';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { JwtModule } from '@nestjs/jwt';
import { envs } from '../../config/envs';
//import { envs } from 'src/config/envs';
//import { LoginService } from '../login.service';

@Module({
  controllers: [LoginController],
  providers: [
    LoginUseCase,
    {
      provide: LOGIN_REPOSITORY,
      useClass: LoginDataSource,
    },
  ],
  imports: [
    JwtModule.register({
      secret: envs.jwtSecret,
      signOptions: { expiresIn: '365d' },
    }),
  ],
})
export class LoginModule {}
