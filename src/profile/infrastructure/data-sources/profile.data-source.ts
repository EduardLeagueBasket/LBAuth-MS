import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ProfileInterfaceRepository } from '../../application/ports/profile-repository.interface';
import { LIST_PROFILES } from '../../domain/constans/profiles.constants';
import { Profile } from '../../domain/entities/profile.intity';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class ProfileDataSource
  extends PrismaClient
  implements ProfileInterfaceRepository, OnModuleInit, OnModuleDestroy
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

  async getListProfiles(): Promise<Profile[]> {
    const profiles = await this.profile.findMany();
    return profiles.map(
      (profile) =>
        new Profile({
          id: profile.id.toString(),
          name: profile.name,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        }),
    );
  }

  async getProfile(id: string): Promise<Profile | null> {
    const profile = await this.profile.findUnique({
      where: { id: Number(id) },
    });
    if (!profile) return null;
    return new Profile({
      id: profile.id.toString(),
      name: profile.name,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  }

  async generateProfile(): Promise<Profile[]> {
    await this.profile.createMany({
      data: LIST_PROFILES.map((profile) => ({
        name: profile.name,
      })),
      skipDuplicates: true,
    });
    return this.profile.findMany().then((profiles) =>
      profiles.map(
        (profile) =>
          new Profile({
            id: profile.id.toString(),
            name: profile.name,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
          }),
      ),
    );
  }
}
