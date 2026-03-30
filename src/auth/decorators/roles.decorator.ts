import { SetMetadata } from '@nestjs/common';

// Definimos una clave constante para el metadata
export const ROLES_KEY = 'roles';

// Este decorador recibirá los roles permitidos (ej: 'ADMIN', 'PROVIDER')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);