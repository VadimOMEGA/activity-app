import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { FestivalProgramDto } from './dto/festival-program.dto'
import { UpdateFestivalProgramDto } from './dto/update-festival-program.dto'
import { AddPresenterDto } from './dto/add-presenter.dto'

@Injectable()
export class FestivalProgramsService {
	constructor(private readonly prisma: PrismaService) {}

	async getAllByEditionId(editionId: string) {
		return this.prisma.festivalProgram.findMany({
			where: { editionId },
			include: {
				festivalProgramPresenters: {
					include: {
						guest: { select: { profile: true, festivalGuestRoles: true } }
					}
				}
			}
		})
	}

	async getById(id: string) {
		return this.prisma.festivalProgram.findUnique({
			where: { id },
			include: {
				festivalProgramPresenters: {
					include: {
						guest: { select: { profile: true, festivalGuestRoles: true } }
					}
				}
			}
		})
	}

	async create(dto: FestivalProgramDto) {
		const start = new Date(dto.startsAt)
		const end = new Date(dto.endsAt)

		if (end <= start) {
			throw new BadRequestException('End time must be after start time')
		}

		const [location, activity] = await Promise.all([
			this.prisma.festivalLocation.findUnique({ where: { id: dto.locationId } }),
			this.prisma.festivalActivity.findUnique({ where: { id: dto.activityId } })
		])

		if (!location) {
			throw new NotFoundException('Location not found')
		}

		if (!activity) {
			throw new NotFoundException('Activity not found')
		}

		if (location.editionId !== dto.editionId) {
			throw new BadRequestException('Location does not belong to this edition')
		}

		const section = await this.prisma.festivalSection.findUnique({
			where: { id: activity.sectionId }
		})

		if (!section || section.editionId !== dto.editionId) {
			throw new BadRequestException('Activity does not belong to this edition')
		}

		const overlap = await this.prisma.festivalProgram.findFirst({
			where: {
				locationId: dto.locationId,
				startsAt: { lt: end },
				endsAt: { gt: start }
			}
		})

		if (overlap) {
			throw new BadRequestException(
				`Location already occupied between ${overlap.startsAt.toISOString()} and ${overlap.endsAt.toISOString()}`
			)
		}

		return this.prisma.festivalProgram.create({
			data: {
				editionId: dto.editionId,
				locationId: dto.locationId,
				activityId: dto.activityId,
				startsAt: start,
				endsAt: end
			}
		})
	}

	async update(programId: string, editionId: string, dto: UpdateFestivalProgramDto) {
		const existing = await this.prisma.festivalProgram.findUnique({
			where: { id: programId }
		})

		if (!existing) {
			throw new NotFoundException('Program not found')
		}

		if (existing.editionId !== editionId) {
			throw new BadRequestException('Program does not belong to this edition')
		}

		const start = dto.startsAt ? new Date(dto.startsAt) : existing.startsAt
		const end = dto.endsAt ? new Date(dto.endsAt) : existing.endsAt
		const locationId = dto.locationId ?? existing.locationId

		if (end <= start) {
			throw new BadRequestException('End time must be after start time')
		}

		if (dto.locationId) {
			const location = await this.prisma.festivalLocation.findUnique({
				where: { id: dto.locationId }
			})

			if (!location) {
				throw new NotFoundException('Location not found')
			}

			if (location.editionId !== editionId) {
				throw new BadRequestException('Location does not belong to this edition')
			}
		}

		const overlap = await this.prisma.festivalProgram.findFirst({
			where: {
				locationId,
				id: { not: programId },
				startsAt: { lt: end },
				endsAt: { gt: start }
			}
		})

		if (overlap) {
			throw new BadRequestException(
				`Location already occupied between ${overlap.startsAt.toISOString()} and ${overlap.endsAt.toISOString()}`
			)
		}

		return this.prisma.festivalProgram.update({
			where: { id: programId },
			data: {
				locationId,
				startsAt: start,
				endsAt: end
			}
		})
	}

	async addPresenter(programId: string, dto: AddPresenterDto) {
		const existingProgram = await this.prisma.festivalProgram.findUnique({
			where: { id: programId }
		})

		if (!existingProgram) {
			throw new NotFoundException('Program not found')
		}

		const guest = await this.prisma.festivalGuest.findUnique({
			where: { id: dto.guestId }
		})

		if (!guest) {
			throw new NotFoundException('Guest not found')
		}

		return this.prisma.festivalProgramPresenter.create({
			data: {
				programId: programId,
				guestId: dto.guestId
			}
		})
	}

	async delete(programId: string) {
		const existing = await this.prisma.festivalProgram.findUnique({
			where: { id: programId }
		})

		if (!existing) {
			throw new NotFoundException('Program not found')
		}

		return this.prisma.festivalProgram.delete({
			where: { id: programId }
		})
	}
}
