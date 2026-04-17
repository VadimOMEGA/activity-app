import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'

import { AdminAuthGuard } from './guards/admin-auth.guard'
import { PrismaService } from 'src/prisma.service'

@Controller('admin/agreements')
export class AdminAgreementsController {
	constructor(private readonly prisma: PrismaService) {}

	@Get()
	@UseGuards(AdminAuthGuard)
	@Render('admin/agreements')
	async listDocuments(@Req() req: Request) {
		const documents = await this.prisma.agreementDocument.findMany({
			orderBy: { createdAt: 'desc' }
		})

		return {
			pageTitle: 'Agreement Documents',
			activePage: 'agreements',
			currentUser: (req as any).adminUser,
			canEdit: (req as any).canEdit,
			documents
		}
	}
}
