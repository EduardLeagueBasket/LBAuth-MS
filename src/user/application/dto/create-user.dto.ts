import { IsEmail, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  profileId: string;

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  /** Liga a la que pertenece el usuario (MANAGER_TEAM, ASISTANT_LEAGUE, etc.). */
  @IsString()
  @IsOptional()
  @IsUUID()
  competitionId?: string;
}
