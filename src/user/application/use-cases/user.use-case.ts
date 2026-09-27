import { Inject, Injectable, Logger } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/constants/injection-tokens';
import type * as UserRepositoryTypes from '../ports/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import type { User } from '@prisma/client';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ListUsersQueryDto } from '../dto/admin-user.dto';
import { RpcException } from '@nestjs/microservices';
import { MailService } from '../../../mail/mail.service';

@Injectable()
export class UserUseCase {
  private readonly logger = new Logger(UserUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryTypes.UserRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(user: CreateUserDto): Promise<unknown> {
    try {
      const newUser = await this.userRepository.createUser(user);
      const provisionalPassword =
        typeof newUser === 'object' &&
        newUser !== null &&
        'provisionalPassword' in newUser
          ? (newUser as { provisionalPassword: string }).provisionalPassword
          : undefined;

      try {
        await this.mailService.sendRegisterUserCredentials({
          email: user.email,
          name: user.name,
          lastName: user.lastName,
          password: provisionalPassword,
        });
      } catch (mailError) {
        this.logger.error(
          `Usuario creado pero falló el envío de correo a ${user.email}`,
          mailError instanceof Error ? mailError.stack : undefined,
        );
      }

      return newUser;
    } catch (error) {
      throw new RpcException({
        status: 'error',
        message: error instanceof Error ? error.message : 'Server error',
      });
    }
  }

  async listUsers(listUsersQueryDto: ListUsersQueryDto): Promise<User[]> {
    return this.userRepository.listUsers(listUsersQueryDto);
  }

  async getUserById(id: string): Promise<User> {
    return this.userRepository.getUserById(id);
  }

  async updateUser(updateUserDto: UpdateUserDto): Promise<User> {
    return this.userRepository.updateUser(updateUserDto);
  }

  deactivateUser(id: string): Promise<User> {
    return this.userRepository.deactivateUser(id);
  }

  setUserCompetition(
    id: string,
    competitionId: string | null,
  ): Promise<User> {
    return this.userRepository.setUserCompetition(id, competitionId);
  }
}
