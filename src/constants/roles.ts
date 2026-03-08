export const WORKER_ROLE_VALUES = ["SUPER_ADMIN", "COORDENADOR", "EVANGELIZADOR"] as const;

export const SUPER_ADMIN_ROLE = "SUPER_ADMIN";
export const COORDENADOR_ROLE = "COORDENADOR";
export const EVANGELIZADOR_ROLE = "EVANGELIZADOR";

export const LEGACY_SUPER_ADMIN_ROLE_VALUES = [
  "super_admin",
  "super",
  SUPER_ADMIN_ROLE,
] as const;

export const LEGACY_COORDENADOR_ROLE_VALUES = [
  "coordenador",
  "worker",
  "admin",
  COORDENADOR_ROLE,
] as const;

export const LEGACY_EVANGELIZADOR_ROLE_VALUES = [
  "evangelizador",
  EVANGELIZADOR_ROLE,
] as const;
