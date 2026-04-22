import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { FestivalVolunteerDto } from './dto/festival-volunteer.dto'

@Injectable()
export class FestivalVolunteersService {
	constructor(private readonly prisma: PrismaService) {}

	async getAllByEditionId(editionId: string) {
		const festivalEdition = await this.prisma.festivalEdition.findUnique({
			where: { id: editionId }
		})

		if (!festivalEdition) throw new NotFoundException('Festival edition not found')

		return this.prisma.festivalVolunteer.findMany({
			where: { editionId },
			include: { profile: true }
		})
	}

	async getById(id: string) {
		const volunteer = await this.prisma.festivalVolunteer.findUnique({
			where: { id },
			include: { profile: true }
		})
		if (!volunteer) throw new NotFoundException('Volunteer not found')
		return volunteer
	}

	async create(dto: FestivalVolunteerDto) {
		const edition = await this.prisma.festivalEdition.findUnique({ where: { id: dto.editionId } })
		if (!edition) throw new NotFoundException('Festival edition not found')

		const existingEmail = await this.prisma.profile.findUnique({ where: { email: dto.email } })
		if (existingEmail) throw new BadRequestException('Email already exists')

		return this.prisma.festivalVolunteer.create({
			data: {
				edition: {
					connect: { id: dto.editionId }
				},
				profile: {
					create: {
						name: dto.name,
						email: dto.email,
						phone: dto.phone,
						birthDate: new Date(dto.birthDate)
					}
				}
			},
			include: { profile: true }
		})
	}

	async delete(id: string) {
		const volunteer = await this.prisma.festivalVolunteer.findUnique({
			where: { id },
			select: { profileId: true }
		})
		if (!volunteer) throw new NotFoundException('Volunteer not found')

		await this.prisma.profile.delete({ where: { id: volunteer.profileId } })

		return { message: 'Festival volunteer deleted successfully' }
	}
}
