import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, UserStatus } from '@prisma/client';
import type { Prisma, User } from '@prisma/client';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UserRepository } from '../../application/ports/user.repository';
import { generateRandomString } from '../../../utils/generate-password';
import * as bcrypt from 'bcrypt';
import { RpcException } from '@nestjs/microservices';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { ListUsersQueryDto } from '../../application/dto/admin-user.dto';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import {
  assertCanAssignProfile,
  isAdminProfile,
} from '../../domain/constants/user-profile-policy';

@Injectable()
export class UserDataSource
  extends PrismaClient
  implements UserRepository, OnModuleInit, OnModuleDestroy
{
  private readonly pool: Pool;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error('DATABASE_URL no está definido');

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    super({ adapter });

    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }

  async createUser(createUserDto: CreateUserDto): Promise<any> {
    try {
      const { userId, email, ...rest } = createUserDto;

      const userProfile = await this.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });
      if (!userProfile) {
        throw new RpcException({ status: 'error', message: 'User not found' });
      }

      const targetProfile = await this.profile.findUnique({
        where: { id: Number(rest.profileId) },
      });
      if (!targetProfile) {
        throw new RpcException({
          status: 'error',
          message: 'Profile not found',
        });
      }
      assertCanAssignProfile(userProfile.profile.name, targetProfile.name);

      const provisionalPassword = generateRandomString();
      const hashedProvisionalPassword = await bcrypt.hash(
        provisionalPassword,
        10,
      );
      const user = {
        ...rest,
        email,
        isSuspended: false,
        requiredChangePassword: true,
        status: UserStatus.ACTIVE,
        password: hashedProvisionalPassword,
        profileId: Number(rest.profileId),
        createdById: userId,
        competitionId: rest.competitionId || null,
      };

      const newUser = await this.user.create({
        data: user,
        include: { profile: true },
      });
      await this.userHistory.create({
        data: {
          userId: newUser.id,
          action: 'CREATE USER',
          field: '',
          oldValue: null,
          newValue: null,
          performedBy: userId,
        },
      });

      return { ...newUser, provisionalPassword };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({ status: 'error', message: 'Server error' });
    }
  }

  async listUsers(listUsersQueryDto: ListUsersQueryDto): Promise<any> {
    const { email, page, limit, search, sortField, sortDirection } =
      listUsersQueryDto;

    const user = await this.user.findUnique({
      where: { email },
      include: { profile: true },
    });
    if (!user) {
      throw new RpcException({ status: 'error', message: 'User not found' });
    }
    if (
      user?.profile?.name == 'MANAGER_LEAGUE' ||
      user?.profile?.name == 'ASISTANT_LEAGUE'
    ) {
      const assistantUserIds =
        user.profile.name === 'MANAGER_LEAGUE'
          ? (
              await this.user.findMany({
                where: {
                  createdById: user.id,
                  profile: { name: 'ASISTANT_LEAGUE' },
                },
                select: { id: true },
              })
            ).map((assistant) => assistant.id)
          : [];

      const users = await this.user.findMany({
        where: {
          OR: [
            { createdById: user.id },
            { createdById: { in: assistantUserIds } },
            ...(user.competitionId
              ? [{ competitionId: user.competitionId }]
              : []),
          ],
          profile: {
            name: {
              in: ['MANAGER_TEAM', 'ASISTANT_LEAGUE'],
            },
          },
        },
        include: {
          profile: true,
        },
      });
      return { data: users };
    }

    if (user?.profile?.name == 'MANAGER_TEAM') {
      const users = await this.user.findMany({
        where: {
          createdById: user.id,
        },
        include: {
          profile: true,
        },
      });
      return { data: users };
    }

    if (
      user?.profile?.name == 'MANAGER_NATIONAL_TEAM' ||
      user?.profile?.name == 'MANAGER_REGIONAL_TEAM'
    ) {
      const users = await this.user.findMany({
        where: {
          createdById: user.id,
        },
        include: {
          profile: true,
        },
      });
      return { data: users };
    }

    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const list = await this.user.findMany({
      where,
      include: {
        profile: true,
      },
      skip,
      take: limit,
      orderBy:
        sortField && sortDirection
          ? ({
              [sortField]: sortDirection,
            } as Record<string, 'asc' | 'desc'>)
          : undefined,
    });
    const total = await this.user.count({ where });
    const totalPages: number = Math.ceil(total / limit);
    return {
      data: list,
      total: total,
      page: page,
      limit: limit,
      totalPages: totalPages,
    };
  }

  async getUserById(id: string): Promise<User> {
    try {
      const history = await this.userHistory.findMany({
        where: {
          OR: [{ userId: id }, { performedBy: id }],
        },
        include: {
          performedByUser: true,
          user: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      const user = await this.user.findUnique({
        where: { id: id },
        include: { profile: true },
      });

      if (!user) {
        throw new RpcException({ status: 'error', message: 'User not found' });
      }
      const userWithHistory = {
        ...user,
        userHistory: history,
      };
      return userWithHistory;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      console.log('Error', error);
      throw new RpcException({ status: 'error', message: 'Server error' });
    }
  }

  async updateUser(updateUserDto: UpdateUserDto): Promise<User> {
    const { id, userId, ...dataToUpdate } = updateUserDto;

    const actor = await this.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!actor) {
      throw new RpcException({ message: 'User not found', status: 'error' });
    }

    const targetProfile = await this.profile.findUnique({
      where: { id: Number(dataToUpdate.profileId) },
    });
    if (!targetProfile) {
      throw new RpcException({
        message: 'Profile not found',
        status: 'error',
      });
    }
    assertCanAssignProfile(actor.profile.name, targetProfile.name);

    // 1. Buscar usuario actual
    const userOld = await this.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!userOld) {
      throw new RpcException({ message: 'User not found', status: 'error' });
    }
    if (
      !isAdminProfile(actor.profile.name) &&
      userOld.createdById !== actor.id
    ) {
      throw new RpcException({
        message: 'No tienes permiso para actualizar este usuario',
        status: 'error',
      });
    }

    // 2. Detectar campos modificados
    const changedFields: {
      field: keyof typeof dataToUpdate;
      oldValue: unknown;
      newValue: unknown;
    }[] = [];

    for (const key of Object.keys(dataToUpdate) as Array<
      keyof typeof dataToUpdate
    >) {
      const raw = dataToUpdate[key];
      const newValue = key === 'profileId' ? Number(raw) : raw;
      if ((userOld as Record<string, unknown>)[String(key)] !== newValue) {
        changedFields.push({
          field: key,
          oldValue: (userOld as Record<string, unknown>)[String(key)],
          newValue,
        });
      }
    }

    // 3. Si no hay cambios, salir
    if (changedFields.length === 0) {
      throw new RpcException({
        message: 'No changes detected',
        status: 'error',
      });
    }

    // 4. Actualizar usuario
    const updatedUser = await this.user.update({
      where: { id },
      data: {
        ...Object.fromEntries(
          changedFields.map((f) => [
            f.field,
            f.field === 'profileId' ? Number(f.newValue) : f.newValue,
          ]),
        ),
      },
      include: { profile: true },
    });

    // 5. Guardar historial de cambios
    await Promise.all(
      changedFields.map((change) =>
        this.userHistory.create({
          data: {
            userId: id,
            performedBy: userId,
            action: 'UPDATE USER',
            field: change.field,
            oldValue: String(change.oldValue),
            newValue: String(change.newValue),
          },
        }),
      ),
    );

    return updatedUser;
  }

  async deactivateUser(id: string): Promise<User> {
    const oldUser = await this.user.findUnique({ where: { id } });
    if (!oldUser) {
      throw new RpcException({ status: 'error', message: 'User not found' });
    }

    const updated = await this.user.update({
      where: { id },
      data: {
        status: UserStatus.INACTIVE,
        isSuspended: true,
      },
    });

    await this.userHistory.create({
      data: {
        userId: id,
        performedBy: id,
        action: 'DEACTIVATE USER',
        field: 'status',
        oldValue: oldUser.status,
        newValue: UserStatus.INACTIVE,
      },
    });

    return updated;
  }

  async setUserCompetition(
    id: string,
    competitionId: string | null,
  ): Promise<User> {
    const user = await this.user.findUnique({ where: { id } });
    if (!user) {
      throw new RpcException({ status: 'error', message: 'User not found' });
    }

    return this.user.update({
      where: { id },
      data: { competitionId },
      include: { profile: true },
    });
  }
}
