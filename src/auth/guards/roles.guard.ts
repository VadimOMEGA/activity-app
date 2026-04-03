import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Request } from 'express'

import { AUTH_KEY } from '../decorators/auth.decorator'
import { PrismaService } from 'src/prisma.service'
import { RoleName } from 'src/generated/prisma/enums'

type AuthenticatedRequest = Request & {
	user?: {
		id?: string
	}
}

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly prisma: PrismaService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(AUTH_KEY, [
			context.getHandler(),
			context.getClass()
		])

		if (!requiredRoles || requiredRoles.length === 0) return true

		const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
		const userId = request.user?.id

		if (!userId) {
			throw new UnauthorizedException('Missing authenticated user')
		}

		const userWithRoles = await this.prisma.user.findUnique({
			where: { id: userId },
			select: {
				roles: {
					select: {
						role: {
							select: {
								name: true
							}
						}
					}
				}
			}
		})

		if (!userWithRoles) {
			throw new ForbiddenException('User not found')
		}

		const roles = userWithRoles.roles.map((userRole) => userRole.role.name)
		const hasRole = roles.some((role) => requiredRoles.includes(role))

		if (!hasRole) {
			throw new ForbiddenException('Insufficient role')
		}

		return true
	}
}
