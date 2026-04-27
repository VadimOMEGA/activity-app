import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'

import { AdminAuthGuard } from './guards/admin-auth.guard'
import { PrismaService } from 'src/prisma.service'

@Controller('admin/festival')
export class AdminFestivalController {
	constructor(private readonly prisma: PrismaService) {}

	@Get('editions')
	@UseGuards(AdminAuthGuard)
	@Render('admin/festival/editions')
	async listEditions(@Req() req: Request) {
		const [editions, tags] = await Promise.all([
			this.prisma.festivalEdition.findMany({
				include: { blogTag: true },
				orderBy: { year: 'desc' }
			}),
			this.prisma.blogTag.findMany({
				orderBy: { name: 'asc' }
			})
		])

		return {
			pageTitle: 'Festival Editions',
			activePage: 'festival-editions',
			currentUser: (req as any).adminUser,
			canEdit: (req as any).canEdit,
			editions,
			tags,
			tagsJson: JSON.stringify(tags)
		}
	}
}
