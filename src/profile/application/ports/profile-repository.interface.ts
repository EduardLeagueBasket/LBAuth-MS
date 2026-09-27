import { Profile } from '../../domain/entities/profile.intity';

export interface ProfileInterfaceRepository {
  getProfile(id: string): Promise<Profile | null>;
  getListProfiles(): Promise<Profile[]>;
  generateProfile(): Promise<Profile[]>;
}
