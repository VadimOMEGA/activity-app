import { Controller, Get, Render, Req, Res, UseGuards } from '@nestjs/common'
import type { Request, Response } from 'express'

import { AdminAuthGuard } from './guards/admin-auth.guard'
import { PrismaService } from 'src/prisma.service'

@Controller('admin')
export class AdminController {
	constructor(private readonly prisma: PrismaService) {}

	// ---- Login (no guard) ----
	@Get('login')
	@Render('admin/login')
	loginPage() {
		return {}
	}

	@Get('logout')
	logout(@Res() res: Response) {
		res.clearCookie('accessToken')
		res.redirect('/admin/login')
	}

	// ---- Dashboard ----
	@Get()
	@UseGuards(AdminAuthGuard)
	@Render('admin/dashboard')
	async dashboard(@Req() req: Request) {
		const [
			users,
			members,
			mentors,
			tutors,
			ninjas,
			meetups,
			sessions,
			assemblies,
			documents,
			fees,
			roles
		] = await Promise.all([
			this.prisma.user.count(),
			this.prisma.member.count(),
			this.prisma.dojoMentor.count(),
			this.prisma.dojoTutor.count(),
			this.prisma.dojoNinja.count(),
			this.prisma.meetup.count(),
			this.prisma.dojoSession.count(),
			this.prisma.generalAssembly.count(),
			this.prisma.agreementDocument.count(),
			this.prisma.membershipFee.count(),
			this.prisma.role.count()
		])

		return {
			pageTitle: 'Dashboard',
			activePage: 'dashboard',
			currentUser: (req as any).adminUser,
			canEdit: (req as any).canEdit,
			counts: {
				users,
				members,
				mentors,
				tutors,
				ninjas,
				meetups,
				sessions,
				assemblies,
				documents,
				fees,
				roles
			}
		}
	}
}
