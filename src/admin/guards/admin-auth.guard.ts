import { ExecutionContext, Injectable } from '@nestjs/common'

import { LoggedInGuard } from './logged-in.guard'

@Injectable()
export class AdminAuthGuard extends LoggedInGuard {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isLoggedIn = await super.canActivate(context)
		if (!isLoggedIn) return false

		const request = context.switchToHttp().getRequest()

		if (!request.hasAdminAccess) {
			this.redirectToLogin(context)
			return false
		}

		return true
	}
}
