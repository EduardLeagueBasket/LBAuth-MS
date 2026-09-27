import { Module } from '@nestjs/common';
import { NatsModule } from './nats/nats.module';
import { UserModule } from './user/presentation/user.module';
import { LoginModule } from './login/presentation/login.module';
import { ProfileModule } from './profile/presentation/profile.module';
import { UpdatePasswordModule } from './update-password/presentation/update-password.module';
import { RegisterModule } from './admin/register/presentation/register.module';

@Module({
  imports: [
    NatsModule,
    UserModule,
    LoginModule,
    ProfileModule,
    UpdatePasswordModule,
    RegisterModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
