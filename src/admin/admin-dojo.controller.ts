import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'

import { AdminAuthGuard } from './guards/admin-auth.guard'
import { PrismaService } from 'src/prisma.service'

@Controller('admin/coderdojo')
export class AdminDojoController {
	constructor(private readonly prisma: PrismaService) {}

	// ---- Mentors ----
	@Get('mentors')
	@UseGuards(AdminAuthGuard)
	@Render('admin/dojo/mentors')
	async listMentors(@Req() req: Request) {
		const mentors = await this.prisma.dojoMentor.findMany({
			include: {
				profile: true,
				dojoSessions: true,
				mentorAgreementSignatures: {
					include: { document: true }
				}
			},
			orderBy: { createdAt: 'desc' }
		})

		const documents = await this.prisma.agreementDocument.findMany({
			orderBy: { name: 'asc' }
		})

		return {
			pageTitle: 'CoderDojo Mentors',
			activePage: 'mentors',
			isCoderDojoOpen: true,
			currentUser: (req as any).adminUser,
			canEdit: (req as any).canEdit,
			mentors,
			documents
		}
	}

	// ---- Tutors ----
	@Get('tutors')
	@UseGuards(AdminAuthGuard)
	@Render('admin/dojo/tutors')
	async listTutors(@Req() req: Request) {
		const tutors = await this.prisma.dojoTutor.findMany({
			include: {
				profile: true,
				dojoNinjas: {
					include: { profile: true }
				},
				tutorAgreementSignatures: {
					include: { document: true }
				}
			},
			orderBy: { createdAt: 'desc' }
		})

		const documents = await this.prisma.agreementDocument.findMany({
			orderBy: { name: 'asc' }
		})

		const profiles = await this.prisma.profile.findMany({
			include: {
				dojoTutor: true,
				dojoNinja: true
			},
			orderBy: { name: 'asc' }
		})

		return {
			pageTitle: 'CoderDojo Tutors',
			activePage: 'tutors',
			isCoderDojoOpen: true,
			currentUser: (req as any).adminUser,
			canEdit: (req as any).canEdit,
			tutors,
			documents,
			profiles
		}
	}

	// ---- Sessions ----
	@Get('sessions')
	@UseGuards(AdminAuthGuard)
	@Render('admin/dojo/sessions')
	async listSessions(@Req() req: Request) {
		const sessions = await this.prisma.dojoSession.findMany({
			include: {
				mentor: {
					include: { profile: true }
				}
			},
			orderBy: { startsAt: 'desc' }
		})

		const mentors = await this.prisma.dojoMentor.findMany({
			include: { profile: true },
			orderBy: { profile: { name: 'asc' } }
		})

		return {
			pageTitle: 'CoderDojo Sessions',
			activePage: 'sessions',
			isCoderDojoOpen: true,
			currentUser: (req as any).adminUser,
			canEdit: (req as any).canEdit,
			canEditSessions: (req as any).canEdit || (req as any).isMentor,
			sessions,
			mentors
		}
	}
}
