import { Profile } from './profile.entity';

export class UserAuth {
  id?: string;
  name: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  token?: string;
  profile?: Profile;
  isSuspended: boolean;
  requiredChangePassword: boolean;
  competitionId?: string | null;

  constructor(params: {
    id?: string;
    name: string;
    lastName: string;
    email: string;
    createdAt?: Date;
    updatedAt?: Date;
    token?: string;
    profile?: Profile;
    isSuspended: boolean;
    requiredChangePassword: boolean;
    competitionId?: string | null;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.lastName = params.lastName;
    this.email = params.email;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
    this.token = params.token;
    this.profile = params.profile;
    this.isSuspended = params.isSuspended;
    this.requiredChangePassword = params.requiredChangePassword;
    this.competitionId = params.competitionId ?? null;
  }
}
