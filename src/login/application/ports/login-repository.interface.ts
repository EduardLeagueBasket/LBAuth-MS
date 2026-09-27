import { UserAuth } from 'src/login/domain/entities/user-auth.entity';

export interface LoginInterfaceRepository {
  login(email: string, password: string): Promise<UserAuth>;
  verifyUserAuthenticate(token: string): Promise<UserAuth>;
}
