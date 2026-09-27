import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginInterfaceRepository } from 'src/login/application/ports/login-repository.interface';
import { UserAuth } from 'src/login/domain/entities/user-auth.entity';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { envs } from 'src/config/envs';
import { Profile } from 'src/login/domain/entities/profile.entity';
import { RpcException } from '@nestjs/microservices';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class LoginDataSource
  extends PrismaClient
  implements LoginInterfaceRepository, OnModuleInit
{
  private readonly jwtService: JwtService;
  private readonly pool: Pool;

  constructor(jwtService: JwtService) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error('DATABASE_URL no está definido');

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    super({ adapter });

    this.pool = pool;
    this.jwtService = jwtService;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }

  async login(email: string, password: string): Promise<UserAuth> {
    try {
      const user = await this.user.findUnique({
        where: { email },
        include: { profile: true },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new RpcException('Invalid Credentials');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        name: user.name,
      };

      const token = await this.jwtService.signAsync(payload, {
        secret: envs.jwtSecret,
        expiresIn: '365d',
      });

      const userAuth = new UserAuth({
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: token,
        isSuspended: user.isSuspended,
        requiredChangePassword: user.requiredChangePassword,
        competitionId: user.competitionId,
        profile: new Profile({
          id: user.profileId.toString(),
          name: user.profile.name,
          createdAt: user.profile.createdAt,
          updatedAt: user.profile.updatedAt,
        }),
      });

      return userAuth;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : 'Error durante el login';
      throw new RpcException(message);
    }
  }

  async verifyUserAuthenticate(token: string): Promise<UserAuth> {
    try {
      type AuthJwtPayload = { sub: string };

      const decoded = await this.jwtService.verifyAsync<AuthJwtPayload>(token, {
        secret: envs.jwtSecret,
      });
      const user = await this.user.findUnique({
        where: { id: decoded.sub },
        include: { profile: true },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid Token');
      }
      return new UserAuth({
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isSuspended: user.isSuspended,
        requiredChangePassword: user.requiredChangePassword,
        competitionId: user.competitionId,
        profile: new Profile({
          id: user.profileId.toString(),
          name: user.profile.name,
          createdAt: user.profile.createdAt,
          updatedAt: user.profile.updatedAt,
        }),
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid Token');
    }
  }
}
