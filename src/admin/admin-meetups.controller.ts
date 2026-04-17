import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'

import { AdminAuthGuard } from './guards/admin-auth.guard'
import { PrismaService } from 'src/prisma.service'

@Controller('admin/meetups')
export class AdminMeetupsController {
	constructor(private readonly prisma: PrismaService) {}

	@Get()
	@UseGuards(AdminAuthGuard)
	@Render('admin/meetups')
	async listMeetups(@Req() req: Request) {
		const meetups = await this.prisma.meetup.findMany({
			include: {
				meetupWorkshop: {
					include: {
						presenter: true
					}
				},
				meetupAntiWorkshop: true
			},
			orderBy: { startsAt: 'desc' }
		})

		const profiles = await this.prisma.profile.findMany({
			include: {
				member: true,
				dojoMentor: true,
				dojoTutor: true,
				dojoNinja: true
			},
			orderBy: { name: 'asc' }
		})

		return {
			pageTitle: 'Meetups',
			activePage: 'meetups',
			currentUser: (req as any).adminUser,
			canEdit: (req as any).canEdit,
			meetups,
			profiles
		}
	}
}
