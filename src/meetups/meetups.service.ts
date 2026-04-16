import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { GetMeetupsDto } from './dto/get-meetups.dto'
import { MeetupType, Prisma } from 'src/generated/prisma/client'
import { AntiWorkshopMeetupDto, WorkshopMeetupDto } from './dto/meetup.dto'
import { UpdateAntiWorkshopMeetupDto, UpdateWorkshopMeetupDto } from './dto/update-meetup.dto'

@Injectable()
export class MeetupsService {
	constructor(private readonly prisma: PrismaService) {}

	getAll(dto: GetMeetupsDto) {
		const where: Prisma.MeetupWhereInput = {}

		if (dto.meetupType === MeetupType.WORKSHOP) {
			where.meetupWorkshop = { isNot: null }

			if (dto.workshopTheme) {
				where.meetupWorkshop = {
					is: {
						theme: dto.workshopTheme
					}
				}
			}
		}

		if (dto.meetupType === MeetupType.ANTI_WORKSHOP) {
			where.meetupAntiWorkshop = { isNot: null }
		}

		return this.prisma.meetup.findMany({
			where,
			include: {
				meetupWorkshop: {
					include: {
						presenter: true
					}
				},
				meetupAntiWorkshop: true
			}
		})
	}

	async getById(id: string) {
		const meetup = await this.prisma.meetup.findUnique({
			where: { id },
			include: {
				meetupWorkshop: {
					include: {
						presenter: true
					}
				},
				meetupAntiWorkshop: true
			}
		})

		if (!meetup) throw new NotFoundException('Meetup not found')

		return meetup
	}

	async createWorkshop(dto: WorkshopMeetupDto) {
		const meetup = await this.prisma.meetup.create({
			data: {
				startsAt: new Date(dto.startsAt),
				location: dto.location,
				meetupWorkshop: {
					create: {
						title: dto.title,
						theme: dto.theme,
						presenterId: dto.presenterId
					}
				}
			}
		})

		return this.getById(meetup.id)
	}

	async createAntiWorkshop(dto: AntiWorkshopMeetupDto) {
		const meetup = await this.prisma.meetup.create({
			data: {
				startsAt: new Date(dto.startsAt),
				location: dto.location,
				meetupAntiWorkshop: {
					create: {
						agenda: dto.agenda
					}
				}
			}
		})

		return this.getById(meetup.id)
	}

	async updateWorkshop(id: string, dto: UpdateWorkshopMeetupDto) {
		const meetup = await this.prisma.meetup.findUnique({
			where: { id },
			include: {
				meetupWorkshop: true
			}
		})

		if (!meetup) throw new NotFoundException('Meetup not found')
		if (!meetup.meetupWorkshop) {
			throw new BadRequestException('Meetup is not a workshop')
		}

		if (!dto || Object.keys(dto).length === 0)
			throw new BadRequestException('No data provided for update')

		await this.prisma.meetup.update({
			where: { id },
			data: {
				startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
				location: dto.location,
				meetupWorkshop: {
					update: {
						title: dto.title,
						theme: dto.theme,
						presenterId: dto.presenterId
					}
				}
			}
		})

		return this.getById(id)
	}

	async updateAntiWorkshop(id: string, dto: UpdateAntiWorkshopMeetupDto) {
		const meetup = await this.prisma.meetup.findUnique({
			where: { id },
			include: {
				meetupAntiWorkshop: true
			}
		})

		if (!meetup) throw new NotFoundException('Meetup not found')
		if (!meetup.meetupAntiWorkshop) {
			throw new BadRequestException('Meetup is not an anti-workshop')
		}

		if (!dto || Object.keys(dto).length === 0)
			throw new BadRequestException('No data provided for update')

		await this.prisma.meetup.update({
			where: { id },
			data: {
				startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
				location: dto.location,
				meetupAntiWorkshop: {
					update: {
						agenda: dto.agenda
					}
				}
			}
		})

		return this.getById(id)
	}

	async delete(id: string) {
		const meetup = await this.prisma.meetup.findUnique({ where: { id } })
		if (!meetup) throw new NotFoundException('Meetup not found')

		await this.prisma.meetup.delete({ where: { id } })

		return { message: 'Meetup deleted successfully' }
	}
}
