import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { UpdatePasswordInterfaceRepository } from 'src/update-password/application/ports/update-password-repository.interface';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class UpdatePasswordDataSource
  extends PrismaClient
  implements UpdatePasswordInterfaceRepository, OnModuleInit
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

  async findUserById(userId: string): Promise<any> {
    try {
      const user = await this.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          lastName: true,
          requiredChangePassword: true,
          isSuspended: true,
        },
      });
      return user;
    } catch (error) {
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      // Encriptar la nueva contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar la contraseña y cambiar requiredChangePassword a false
      await this.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          requiredChangePassword: false,
          updatedAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      throw new Error(`Error al actualizar contraseña: ${error.message}`);
    }
  }
}
