import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

/**
 * Guards routes based on the X-User-Role header injected by Traefik forwardAuth.
 * If no @Roles() decorator is set, the route is accessible to any authenticated user.
 * If @Roles() is set, the user's role must match one of the allowed roles.
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const request = context.switchToHttp().getRequest();
        const userId = request.headers['x-user-id'];
        const userRole = request.headers['x-user-role'];

        if (!userId || !userRole) {
            throw new UnauthorizedException('Missing authentication headers');
        }

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        if (!requiredRoles.includes(userRole)) {
            throw new ForbiddenException(
                `Access denied. Required role: ${requiredRoles.join(' or ')}`,
            );
        }

        return true;
    }
}
