import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { DojoSessionDto } from './dto/dojo-session.dto'
import { UpdateDojoSessionDto } from './dto/update-dojo-session.dto'

@Injectable()
export class DojoSessionsService {
	constructor(private readonly prisma: PrismaService) {}

	getAll() {
		return this.prisma.dojoSession.findMany({
			include: {
				mentor: true
			}
		})
	}

	async getById(id: string) {
		const session = await this.prisma.dojoSession.findUnique({
			where: { id },
			include: {
				mentor: true
			}
		})

		if (!session) throw new NotFoundException('Dojo session not found')

		return session
	}

	async create(dto: DojoSessionDto) {
		const startsAt = new Date(dto.startsAt)

		if (startsAt <= new Date()) {
			throw new BadRequestException('startsAt must be in the future')
		}

		const mentor = await this.prisma.dojoMentor.findUnique({
			where: { id: dto.mentorId }
		})

		if (!mentor) throw new NotFoundException('Mentor not found')

		return this.prisma.dojoSession.create({
			data: {
				startsAt,
				location: dto.location,
				theme: dto.theme,
				mentorId: dto.mentorId
			},
			include: {
				mentor: true
			}
		})
	}

	async update(id: string, dto: UpdateDojoSessionDto) {
		const session = await this.prisma.dojoSession.findUnique({
			where: { id }
		})
		if (!session) throw new NotFoundException('Dojo session not found')

		if (!dto || Object.keys(dto).length === 0)
			throw new BadRequestException('No data provided for update')

		if (dto.mentorId !== undefined) {
			const mentor = await this.prisma.dojoMentor.findUnique({
				where: { id: dto.mentorId }
			})
			if (!mentor) throw new NotFoundException('Mentor not found')
		}

		if (dto.startsAt && new Date(dto.startsAt) <= new Date()) {
			throw new BadRequestException('startsAt must be in the future')
		}

		return this.prisma.dojoSession.update({
			where: { id },
			data: {
				startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
				location: dto.location,
				theme: dto.theme,
				mentorId: dto.mentorId
			},
			include: {
				mentor: true
			}
		})
	}

	async delete(id: string) {
		const session = await this.prisma.dojoSession.findUnique({
			where: { id }
		})
		if (!session) throw new NotFoundException('Dojo session not found')

		await this.prisma.dojoSession.delete({ where: { id } })

		return { message: 'Dojo session deleted successfully' }
	}
}
