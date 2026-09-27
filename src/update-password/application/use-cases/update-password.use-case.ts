import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { UpdatePasswordInterfaceRepository } from '../ports/update-password-repository.interface';
import { UPDATE_PASSWORD_REPOSITORY } from 'src/update-password/domain/constants/injection-tokens';
import type { User } from '@prisma/client';
//import { UPDATE_PASSWORD_REPOSITORY } from 'src/update-password/domain/constants/injection-tokens';

@Injectable()
export class UpdatePasswordUseCase {
  constructor(
    @Inject(UPDATE_PASSWORD_REPOSITORY)
    private readonly updatePasswordRepository: UpdatePasswordInterfaceRepository,
  ) {}

  async execute(userId: string, newPassword: string): Promise<boolean> {
    // Verificar que el usuario existe
    const user = (await this.updatePasswordRepository.findUserById(
      userId,
    )) as User | null;
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Actualizar la contraseña
    const result = await this.updatePasswordRepository.updatePassword(
      userId,
      newPassword,
    );
    return result;
  }
}
