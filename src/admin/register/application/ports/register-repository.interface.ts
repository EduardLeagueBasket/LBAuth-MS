import { Register } from '../../domain/entities/register.entity';

export interface RegisterInterfaceRepository {
  create(register: Register): Promise<Register>;
  findByEmail(email: string): Promise<Register | null>;
  profileExists(profileId: number): Promise<boolean>;
}
