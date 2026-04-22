import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { FestivalLocationDto } from './dto/festival-location.dto'
import { UpdateFestivalLocationDto } from './dto/update-festival-location.dto'

@Injectable()
export class FesivalLocationsService {
	constructor(private readonly prisma: PrismaService) {}

	async getAllByEditionId(editionId: string) {
		const festivalEdition = await this.prisma.festivalEdition.findUnique({
			where: { id: editionId }
		})

		if (!festivalEdition) throw new NotFoundException('Festival edition not found')

		return this.prisma.festivalLocation.findMany({
			where: { editionId },
			include: { coordinator: { include: { profile: true } }, festivalPrograms: true }
		})
	}

	async getById(id: string) {
		const festivalLocation = await this.prisma.festivalLocation.findUnique({
			where: { id },
			include: { coordinator: { include: { profile: true } }, festivalPrograms: true }
		})

		if (!festivalLocation) throw new NotFoundException('Festival location not found')

		return festivalLocation
	}

	async create(dto: FestivalLocationDto) {
		const festivalEdition = await this.prisma.festivalEdition.findUnique({
			where: { id: dto.editionId }
		})

		if (!festivalEdition) throw new NotFoundException('Festival edition not found')

		const festivalVolunteer = await this.prisma.festivalVolunteer.findUnique({
			where: { id: dto.coordinatorId }
		})

		if (!festivalVolunteer) throw new NotFoundException('Festival volunteer not found')

		return this.prisma.festivalLocation.create({
			data: dto
		})
	}

	async update(id: string, dto: UpdateFestivalLocationDto) {
		const festivalLocation = await this.prisma.festivalLocation.findUnique({
			where: { id }
		})

		if (!festivalLocation) throw new NotFoundException('Festival location not found')

		if (dto.coordinatorId) {
			const festivalVolunteer = await this.prisma.festivalVolunteer.findUnique({
				where: { id: dto.coordinatorId }
			})

			if (!festivalVolunteer) throw new NotFoundException('Festival volunteer not found')
		}

		return this.prisma.festivalLocation.update({
			where: { id },
			data: dto
		})
	}

	async delete(id: string) {
		const festivalLocation = await this.prisma.festivalLocation.findUnique({
			where: { id }
		})

		if (!festivalLocation) throw new NotFoundException('Festival location not found')

		return this.prisma.festivalLocation.delete({
			where: { id }
		})
	}
}
