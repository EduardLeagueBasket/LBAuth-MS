export class UpdatePasswordResponse {
  constructor(
    public readonly success: boolean,
    public readonly message: string,
    public readonly userId: string,
  ) {}
}
