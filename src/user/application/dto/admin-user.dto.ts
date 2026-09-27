import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AdminDto {
  @IsNotEmpty()
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  profileId: string;
}

import { IsNumber, IsOptional, IsIn } from 'class-validator';

export class ListUsersQueryDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  sortField?: string;

  @IsString()
  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortDirection?: 'asc' | 'desc';

  @IsString()
  @IsOptional()
  typeUser?: string;
}
