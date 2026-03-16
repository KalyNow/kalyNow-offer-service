import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: string;
}

/**
 * Extracts the authenticated user from headers injected by Traefik forwardAuth.
 * Headers: X-User-Id, X-User-Email, X-User-Role
 */
export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
        const request = ctx.switchToHttp().getRequest();
        return {
            id: request.headers['x-user-id'],
            email: request.headers['x-user-email'],
            role: request.headers['x-user-role'],
        };
    },
);
