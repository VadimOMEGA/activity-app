import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'

import { AdminAuthGuard } from './guards/admin-auth.guard'
import { PrismaService } from 'src/prisma.service'

@Controller('admin/users')
export class AdminUsersController {
	constructor(private readonly prisma: PrismaService) {}

	@Get()
	@UseGuards(AdminAuthGuard)
	@Render('admin/users')
	async listUsers(@Req() req: Request) {
		const users = await this.prisma.user.findMany({
			where: {
				NOT: {
					roles: {
						some: {
							role: {
								name: 'ADMIN'
							}
						}
					}
				}
			},
			include: {
				profile: true,
				roles: {
					include: {
						role: true
					}
				}
			},
			orderBy: { createdAt: 'desc' }
		})

		const roles = await this.prisma.role.findMany()

		return {
			pageTitle: 'Users',
			activePage: 'users',
			currentUser: (req as any).adminUser,
			canEdit: (req as any).canEdit,
			users,
			roles
		}
	}
}
