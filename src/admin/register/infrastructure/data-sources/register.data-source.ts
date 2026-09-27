import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { RegisterInterfaceRepository } from '../../application/ports/register-repository.interface';
import { PrismaClient } from '@prisma/client';
import { Register } from '../../domain/entities/register.entity';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class RegisterDataSource
  extends PrismaClient
  implements RegisterInterfaceRepository, OnModuleInit, OnModuleDestroy
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

  async findByEmail(email: string): Promise<Register | null> {
    const user = await this.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }

    return new Register({
      //id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      profileId: user.profileId,
      requiredChangePassword: user.requiredChangePassword,
      emailVerified: user.emailVerified,
      isSuspended: user.isSuspended,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async create(register: Register): Promise<any> {
    const user = await this.user.create({
      data: {
        name: register.name,
        lastName: register.lastName,
        email: register.email,
        password: register.password,
        requiredChangePassword: false,
        isSuspended: false,
        emailVerified: true,
        profile: {
          connect: {
            id: register.profileId,
          },
        },
      },
    });

    const { ...userWithoutPassword } = user;

    return { user: userWithoutPassword };
  }

  async profileExists(profileId: number): Promise<boolean> {
    const profile = await this.profile.findUnique({ where: { id: profileId } });
    return !!profile;
  }
}
