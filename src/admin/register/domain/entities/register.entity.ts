import { UserStatus } from '@prisma/client';

export class Register {
  id?: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  profileId: number;
  requiredChangePassword: boolean;
  emailVerified: boolean;
  isSuspended: boolean;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id?: string;
    name: string;
    lastName: string;
    email: string;
    password: string;
    profileId: number;
    requiredChangePassword: boolean;
    emailVerified: boolean;
    isSuspended: boolean;
    status: UserStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.name = params.name;
    this.lastName = params.lastName;
    this.email = params.email;
    this.password = params.password;
    this.profileId = params.profileId;
    this.requiredChangePassword = params.requiredChangePassword;
    this.emailVerified = params.emailVerified;
    this.isSuspended = params.isSuspended;
    this.status = params.status;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }
}
