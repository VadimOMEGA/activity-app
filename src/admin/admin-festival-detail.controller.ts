import { Controller, Get, Param, Render, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'

import { AdminAuthGuard } from './guards/admin-auth.guard'
import { PrismaService } from 'src/prisma.service'

@Controller('admin/festival/editions')
export class AdminFestivalDetailController {
	constructor(private readonly prisma: PrismaService) {}

	@Get(':id')
	@UseGuards(AdminAuthGuard)
	@Render('admin/festival/edition-detail')
	async editionDetail(@Param('id') id: string, @Req() req: Request) {
		const edition = await this.prisma.festivalEdition.findUnique({
			where: { id },
			include: {
				blogTag: true,
				festivalEditionGalleryPhotos: {
					orderBy: { sortOrder: 'asc' }
				},
				festivalSections: {
					include: {
						festivalActivities: true
					}
				},
				festivalLocations: {
					include: {
						coordinator: { include: { profile: true } }
					}
				},
				festivalVolunteers: {
					include: { profile: true }
				},
				festivalStaffMembers: {
					include: { member: { include: { profile: true } } }
				},
				festivalGuests: {
					include: { profile: true, festivalGuestRoles: true }
				},
				festivalSponsors: true,
				festivalTickets: true,
				festivalPrograms: true
			}
		})

		if (!edition) {
			return {
				pageTitle: 'Edition Not Found',
				activePage: 'festival-editions',
				currentUser: (req as any).adminUser,
				canEdit: (req as any).canEdit,
				edition: null
			}
		}

		const activityCount = edition.festivalSections.reduce(
			(sum, s) => sum + s.festivalActivities.length,
			0
		)

		const members = await this.prisma.member.findMany({
			include: { profile: true },
			orderBy: { profile: { name: 'asc' } }
		})

		const guestRoles = ['SPEAKER', 'WORKSHOP_ORGANIZER', 'ARTIST', 'OTHER']

		return {
			pageTitle: `Edition ${edition.year}`,
			activePage: 'festival-editions',
			activeTab: 'overview',
			currentUser: (req as any).adminUser,
			canEdit: (req as any).canEdit,
			edition,
			editionJson: JSON.stringify(edition),
			members,
			membersJson: JSON.stringify(members),
			guestRoles,
			counts: {
				sections: edition.festivalSections.length,
				activities: activityCount,
				locations: edition.festivalLocations.length,
				volunteers: edition.festivalVolunteers.length,
				staff: edition.festivalStaffMembers.length,
				guests: edition.festivalGuests.length,
				sponsors: edition.festivalSponsors.length,
				tickets: edition.festivalTickets.length,
				gallery: edition.festivalEditionGalleryPhotos.length,
				programs: edition.festivalPrograms.length
			}
		}
	}

	@Get(':id/schedule')
	@UseGuards(AdminAuthGuard)
	@Render('admin/festival/edition-schedule')
	async editionSchedule(@Param('id') id: string, @Req() req: Request) {
		const [edition, programs, locations, activities, guests] = await Promise.all([
			this.prisma.festivalEdition.findUnique({ where: { id } }),
			this.prisma.festivalProgram.findMany({
				where: { editionId: id },
				include: {
					activity: { include: { section: true } },
					location: true,
					festivalProgramPresenters: { include: { guest: { include: { profile: true } } } }
				},
				orderBy: { startsAt: 'asc' }
			}),
			this.prisma.festivalLocation.findMany({ where: { editionId: id }, orderBy: { name: 'asc' } }),
			this.prisma.festivalActivity.findMany({
				where: { section: { editionId: id } },
				include: { section: true },
				orderBy: { title: 'asc' }
			}),
			this.prisma.festivalGuest.findMany({
				where: { editionId: id },
				include: { profile: true },
				orderBy: { profile: { name: 'asc' } }
			})
		])
		if (!edition)
			return {
				pageTitle: 'Not Found',
				activePage: 'festival-editions',
				edition: null,
				currentUser: (req as any).adminUser,
				canEdit: (req as any).canEdit
			}
		return {
			pageTitle: `Schedule — ${edition.year}`,
			activePage: 'festival-editions',
			activeTab: 'schedule',
			currentUser: (req as any).adminUser,
			canEdit: (req as any).canEdit,
			edition,
			programs,
			locations,
			locationsJson: JSON.stringify(locations),
			activities,
			activitiesJson: JSON.stringify(activities),
			guests,
			guestsJson: JSON.stringify(guests)
		}
	}

	@Get(':id/sponsors')
	@UseGuards(AdminAuthGuard)
	@Render('admin/festival/edition-sponsors')
	async editionSponsors(@Param('id') id: string, @Req() req: Request) {
		const [edition, sponsors] = await Promise.all([
			this.prisma.festivalEdition.findUnique({ where: { id } }),
			this.prisma.festivalSponsor.findMany({
				where: { editionId: id },
				include: { festivalSponsorDiscountLocations: true },
				orderBy: { level: 'asc' }
			})
		])
		if (!edition)
			return {
				pageTitle: 'Not Found',
				activePage: 'festival-editions',
				edition: null,
				currentUser: (req as any).adminUser,
				canEdit: (req as any).canEdit
			}
		return {
			pageTitle: `Sponsors — ${edition.year}`,
			activePage: 'festival-editions',
			activeTab: 'sponsors',
			currentUser: (req as any).adminUser,
			canEdit: (req as any).canEdit,
			edition,
			sponsors,
			sponsorsJson: JSON.stringify(sponsors)
		}
	}

	@Get(':id/tickets')
	@UseGuards(AdminAuthGuard)
	@Render('admin/festival/edition-tickets')
	async editionTickets(@Param('id') id: string, @Req() req: Request) {
		const [edition, tickets, sponsors] = await Promise.all([
			this.prisma.festivalEdition.findUnique({ where: { id } }),
			this.prisma.festivalTicket.findMany({
				where: { editionId: id },
				include: {
					holderProfile: true,
					festivalDiscountRedeemings: {
						include: { discountLocation: { include: { sponsor: true } } }
					}
				},
				orderBy: { createdAt: 'desc' }
			}),
			this.prisma.festivalSponsor.findMany({
				where: { editionId: id },
				include: { festivalSponsorDiscountLocations: true },
				orderBy: { name: 'asc' }
			})
		])
		if (!edition)
			return {
				pageTitle: 'Not Found',
				activePage: 'festival-editions',
				edition: null,
				currentUser: (req as any).adminUser,
				canEdit: (req as any).canEdit
			}
		return {
			pageTitle: `Tickets — ${edition.year}`,
			activePage: 'festival-editions',
			activeTab: 'tickets',
			currentUser: (req as any).adminUser,
			canEdit: (req as any).canEdit,
			edition,
			tickets,
			ticketsJson: JSON.stringify(tickets),
			sponsors,
			sponsorsJson: JSON.stringify(sponsors)
		}
	}
}
