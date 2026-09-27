import { IsString, IsUUID } from 'class-validator';

import { IsNotEmpty } from 'class-validator';

export class IdUserDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
