export interface UpdatePasswordInterfaceRepository {
  updatePassword(userId: string, newPassword: string): Promise<boolean>;
  findUserById(userId: string): Promise<any>;
}
