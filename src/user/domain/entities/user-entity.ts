// domain/entities/User.ts
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface UserProps {
  id: string;
  email: string;
  password: string;
  name: string;
  lastName: string;
  status: UserStatus;
  requiredChangePassword: boolean;
  isSuspended: boolean;
  phone?: string;
  createdById?: string;
  profileId: number;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  emailVerified: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = {
      ...props,
      status: props.status ?? UserStatus.ACTIVE,
      requiredChangePassword: props.requiredChangePassword ?? true,
      isSuspended: props.isSuspended ?? false,
      emailVerified: props.emailVerified ?? false,
    };
  }

  // Getters
  get id() {
    return this.props.id;
  }

  get email() {
    return this.props.email;
  }

  get name() {
    return this.props.name;
  }

  get lastName() {
    return this.props.lastName;
  }

  get status() {
    return this.props.status;
  }

  get profileId() {
    return this.props.profileId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get lastLoginAt() {
    return this.props.lastLoginAt;
  }

  // Métodos de dominio
  suspend() {
    this.props.isSuspended = true;
    this.props.status = UserStatus.SUSPENDED;
  }

  activate() {
    this.props.isSuspended = false;
    this.props.status = UserStatus.ACTIVE;
  }

  requirePasswordChange() {
    this.props.requiredChangePassword = true;
  }

  verifyEmail(token: string) {
    if (this.props.emailVerificationToken === token) {
      this.props.emailVerified = true;
      this.props.emailVerificationToken = undefined;
    } else {
      throw new Error('Invalid verification token');
    }
  }

  toJSON() {
    return {
      ...this.props,
    };
  }
}
