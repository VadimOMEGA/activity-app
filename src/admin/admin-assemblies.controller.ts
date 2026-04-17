import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'

import { AdminAuthGuard } from './guards/admin-auth.guard'
import { PrismaService } from 'src/prisma.service'

@Controller('admin/general-assemblies')
export class AdminAssembliesController {
	constructor(private readonly prisma: PrismaService) {}

	@Get()
	@UseGuards(AdminAuthGuard)
	@Render('admin/assemblies')
	async listAssemblies(@Req() req: Request) {
		const assemblies = await this.prisma.generalAssembly.findMany({
			include: {
				generalAssemblyAttendees: {
					include: {
						member: {
							include: { profile: true }
						}
					}
				}
			},
			orderBy: { year: 'desc' }
		})

		const members = await this.prisma.member.findMany({
			include: { profile: true },
			orderBy: { profile: { name: 'asc' } }
		})

		return {
			pageTitle: 'General Assemblies',
			activePage: 'assemblies',
			currentUser: (req as any).adminUser,
			canEdit: (req as any).canEdit,
			assemblies,
			members
		}
	}
}
