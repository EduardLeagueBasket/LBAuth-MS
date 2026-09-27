export class Profile {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }
}
