import { Inject, Injectable, Logger } from '@nestjs/common';
import type { RegisterInterfaceRepository } from '../ports/register-repository.interface';
import { Register } from '../../domain/entities/register.entity';
import { CreateRegisterDto } from '../dto/create-register.dto';
import { envs } from 'src/config/envs';
import * as bcrypt from 'bcrypt';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { REGISTER_REPOSITORY } from '../../domain/constats/injection-tokens';
import { UserStatus } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { NATS_SERVICE } from 'src/config/service';

@Injectable()
export class RegisterUserUseCase {
  private logger = new Logger('RegisterUserUseCase');
  constructor(
    @Inject(REGISTER_REPOSITORY)
    private readonly registerInterfaceRepository: RegisterInterfaceRepository,
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  async execute(registerDto: CreateRegisterDto): Promise<Register> {
    try {
      const { name, lastName, email, password, profileId } = registerDto;

      const existingUser: Register | null =
        await this.registerInterfaceRepository.findByEmail(email);
      if (existingUser) {
        throw new RpcException({ code: 400, message: 'User already exists' });
      }

      const profileExists: boolean =
        await this.registerInterfaceRepository.profileExists(profileId);
      if (!profileExists) {
        throw new RpcException({
          code: 404,
          message: 'Profile does not exist',
        });
      }

      const hashedPassword = await this.hashPassword(password);

      const user = new Register({
        name,
        lastName,
        email,
        password: hashedPassword,
        profileId,
        requiredChangePassword: true,
        emailVerified: false,
        isSuspended: false,
        status: UserStatus.ACTIVE,
      });

      const newUser = await this.registerInterfaceRepository.create(user);
      await firstValueFrom(
        this.client.emit('register-user-mail', {
          email: user.email,
          name: user.name,
          lastName: user.lastName,
          password: '********',
        }),
      );
      return newUser;
    } catch (error) {
      this.logger.error(error);
      throw new RpcException({ code: 500, message: 'Internal server error' });
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = envs.salt;
    return bcrypt.hash(password, saltRounds);
  }
}
