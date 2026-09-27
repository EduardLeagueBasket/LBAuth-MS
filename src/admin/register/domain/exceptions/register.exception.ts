export class RegisterAlreadyExistsException extends Error {
  constructor(email: string) {
    super(`El usuario con email ${email} ya existe`);
    this.name = 'RegisterAlreadyExistsException';
  }
}
