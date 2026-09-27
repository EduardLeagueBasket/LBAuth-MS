import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ListUsersQueryDto } from '../dto/admin-user.dto';
import type { User } from '@prisma/client';

export interface UserRepository {
  createUser(user: CreateUserDto): Promise<unknown>;
  listUsers(listUsersQueryDto: ListUsersQueryDto): Promise<User[]>;
  getUserById(id: string): Promise<User>;
  updateUser(updateUserDto: UpdateUserDto): Promise<User>;
  deactivateUser(id: string): Promise<User>;
  setUserCompetition(
    id: string,
    competitionId: string | null,
  ): Promise<User>;
}
