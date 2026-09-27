import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import {
  AdminDto,
  ListUsersQueryDto,
} from '../../application/dto/admin-user.dto';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UserUseCase } from '../../application/use-cases/user.use-case';
import { IdUserDto } from '../../application/dto/id-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';

@Controller()
export class UserController {
  constructor(private readonly userUseCase: UserUseCase) {}

  @MessagePattern('create-user')
  async createUser(@Payload() createUserDto: CreateUserDto) {
    try {
      return this.userUseCase.execute(createUserDto);
    } catch (error) {
      throw new RpcException({
        status: 'error',
        message: error instanceof Error ? error.message : 'Server error',
      });
    }
  }

  @MessagePattern('auth.create-user')
  async createUserV2(@Payload() createUserDto: CreateUserDto) {
    console.log('createUserDto', createUserDto);
    return this.createUser(createUserDto);
  }

  @MessagePattern('list-users')
  listUsers(@Payload() payload: { admin: AdminDto } & ListUsersQueryDto) {
    // TODO: Implement admin check
    return this.userUseCase.listUsers({
      email: payload.admin.email,
      page: payload.page,
      limit: payload.limit,
      search: payload.search,
      sortField: payload.sortField,
      sortDirection: payload.sortDirection,
      typeUser: payload.typeUser,
    });
  }

  @MessagePattern('auth.list-users')
  async listUsersV2(
    @Payload() payload: { admin: AdminDto } & ListUsersQueryDto,
  ) {
    return this.listUsers(payload);
  }

  @MessagePattern('get-user-by-id')
  getUserById(@Payload() idUser: IdUserDto) {
    // TODO: Implement admin check
    const { id } = idUser;
    return this.userUseCase.getUserById(id);
  }

  @MessagePattern('auth.get-user-by-id')
  async getUserByIdV2(@Payload() idUser: IdUserDto) {
    return this.getUserById(idUser);
  }

  @MessagePattern('update-user')
  updateUser(@Payload() updateUserDto: UpdateUserDto) {
    return this.userUseCase.updateUser(updateUserDto);
  }

  @MessagePattern('auth.update-user')
  async updateUserV2(@Payload() updateUserDto: UpdateUserDto) {
    return this.updateUser(updateUserDto);
  }

  @MessagePattern('auth.deactivate-user')
  deactivateUser(@Payload() dto: IdUserDto) {
    return this.userUseCase.deactivateUser(dto.id);
  }

  @MessagePattern('auth.set-user-competition')
  setUserCompetition(
    @Payload() dto: { id: string; competitionId?: string | null },
  ) {
    return this.userUseCase.setUserCompetition(
      dto.id,
      dto.competitionId ?? null,
    );
  }
}
