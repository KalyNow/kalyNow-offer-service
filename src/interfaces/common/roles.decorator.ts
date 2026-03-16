import { SetMetadata } from '@nestjs/common';

export enum UserRole {
    BUYER = 'BUYER',
    SELLER = 'SELLER',
    ADMIN = 'ADMIN',
}

export const ROLES_KEY = 'roles';

/**
 * Restrict a route to specific roles.
 * Role is read from the X-User-Role header injected by Traefik forwardAuth.
 *
 * @example @Roles(UserRole.SELLER)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
