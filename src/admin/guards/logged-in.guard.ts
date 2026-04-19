import {
	CanActivate,
	ExecutionContext,
	Injectable
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

import { PrismaService } from 'src/prisma.service'
import { RoleName } from 'src/generated/prisma/enums'

const ADMIN_ROLES: RoleName[] = [RoleName.ADMIN, RoleName.MENTOR, RoleName.MEMBER]

@Injectable()
export class LoggedInGuard implements CanActivate {
	constructor(
		protected readonly jwt: JwtService,
		protected readonly config: ConfigService,
		protected readonly prisma: PrismaService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>()

		// Extract access token from cookie
		const token = this.extractTokenFromCookie(request)
		if (!token) {
			this.redirectToLogin(context)
			return false
		}

		let payload: { id: string }
		try {
			payload = await this.jwt.verifyAsync<{ id: string }>(token, {
				secret: this.config.get<string>('JWT_SECRET')
			})
		} catch {
			// Access token is expired/invalid. Try to refresh via refresh token
			const cookies = request.cookies as Record<string, string> | undefined
			const refreshToken = cookies?.refreshToken

			if (!refreshToken) {
				this.redirectToLogin(context)
				return false
			}

			try {
				payload = await this.jwt.verifyAsync<{ id: string }>(refreshToken, {
					secret: this.config.get<string>('JWT_SECRET')
				})

				// Issue a new access token
				const newAccessToken = this.jwt.sign({ id: payload.id })

				// Set it in the cookie for future requests
				const response = context.switchToHttp().getResponse()
				response.cookie('accessToken', newAccessToken, {
					path: '/',
					sameSite: 'lax'
				})
			} catch {
				this.redirectToLogin(context)
				return false
			}
		}

		// Load user with roles and profile
		const user = await this.prisma.user.findUnique({
			where: { id: payload.id },
			include: {
				profile: true,
				roles: {
					include: {
						role: true
					}
				}
			}
		})

		if (!user) {
			this.redirectToLogin(context)
			return false
		}

		const roleNames = user.roles.map((ur) => ur.role.name)
		const hasAdminAccess = roleNames.some((role) => ADMIN_ROLES.includes(role))

		// Attach user + computed flags to request
		;(request as any).adminUser = user
		;(request as any).canEdit = roleNames.includes(RoleName.ADMIN)
		;(request as any).isMentor = roleNames.includes(RoleName.MENTOR)
		;(request as any).userRoleNames = roleNames
		;(request as any).hasAdminAccess = hasAdminAccess

		return true
	}

	protected extractTokenFromCookie(request: Request): string | undefined {
		const cookies = request.cookies as Record<string, string> | undefined
		return cookies?.accessToken
	}

	protected redirectToLogin(context: ExecutionContext) {
		const response = context.switchToHttp().getResponse()
		response.redirect('/admin/login')
	}
}
