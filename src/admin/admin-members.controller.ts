import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'

import { AdminAuthGuard } from './guards/admin-auth.guard'
import { PrismaService } from 'src/prisma.service'

@Controller('admin/members')
export class AdminMembersController {
	constructor(private readonly prisma: PrismaService) {}

	@Get()
	@UseGuards(AdminAuthGuard)
	@Render('admin/members')
	async listMembers(@Req() req: Request) {
		const members = await this.prisma.member.findMany({
			include: {
				profile: true,
				aspiringMember: true,
				fullMember: true,
				membershipFees: {
					orderBy: { year: 'desc' }
				}
			},
			orderBy: { createdAt: 'desc' }
		})

		return {
			pageTitle: 'Members',
			activePage: 'members',
			currentUser: (req as any).adminUser,
			canEdit: (req as any).canEdit,
			members
		}
	}
}
