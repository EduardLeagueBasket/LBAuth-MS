import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UpdatePasswordDto } from '../../application/dto/update-password.dto';
import { UpdatePasswordUseCase } from '../../application/use-cases/update-password.use-case';
import { UpdatePasswordResponse } from '../../domain/entities/update-password-response.entity';

@Controller()
export class UpdatePasswordController {
  constructor(private readonly updatePasswordUseCase: UpdatePasswordUseCase) {}

  @MessagePattern('update-password')
  async updatePassword(
    @Payload() updatePasswordDto: UpdatePasswordDto,
  ): Promise<UpdatePasswordResponse> {
    try {
      const result = await this.updatePasswordUseCase.execute(
        updatePasswordDto.userId,
        updatePasswordDto.newPassword,
      );

      return new UpdatePasswordResponse(
        result,
        'Contraseña actualizada exitosamente',
        updatePasswordDto.userId,
      );
    } catch (error) {
      return new UpdatePasswordResponse(
        false,
        error || 'Error al actualizar contraseña',
        updatePasswordDto.userId,
      );
    }
  }

  @MessagePattern('auth.update-password')
  async updatePasswordV2(
    @Payload() updatePasswordDto: UpdatePasswordDto,
  ): Promise<UpdatePasswordResponse> {
    return this.updatePassword(updatePasswordDto);
  }
}
