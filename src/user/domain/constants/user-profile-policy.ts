import { RpcException } from '@nestjs/microservices';

const ADMIN_PROFILES = new Set(['ADMIN', 'SUPER_ADMIN']);

const ALLOWED_PROFILE_BY_MANAGER: Record<string, string> = {
  MANAGER_LEAGUE: 'ASISTANT_LEAGUE',
  MANAGER_TEAM: 'ASISTANT_TEAM',
  MANAGER_NATIONAL_TEAM: 'ASISTANT_NATIONAL_TEAM',
  MANAGER_REGIONAL_TEAM: 'ASISTANT_REGIONAL_TEAM',
};

export function isAdminProfile(profile: string | undefined): boolean {
  return Boolean(profile && ADMIN_PROFILES.has(profile));
}

export function assertCanAssignProfile(
  actorProfile: string | undefined,
  targetProfile: string | undefined,
): void {
  if (isAdminProfile(actorProfile)) {
    return;
  }

  const allowedProfile = actorProfile
    ? ALLOWED_PROFILE_BY_MANAGER[actorProfile]
    : undefined;

  if (!allowedProfile || allowedProfile !== targetProfile) {
    throw new RpcException({
      status: 'error',
      message: 'No tienes permiso para asignar ese perfil de usuario',
    });
  }
}
