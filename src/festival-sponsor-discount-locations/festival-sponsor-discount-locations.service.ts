import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { DiscountLocationDto } from './dto/discount-location.dto'
import { UpdateDiscountLocationDto } from './dto/update-discount-location.dto'

@Injectable()
export class FestivalSponsorDiscountLocationsService {
	constructor(private readonly prisma: PrismaService) {}

	async create(dto: DiscountLocationDto) {
		const existingSponsor = await this.prisma.festivalSponsor.findUnique({
			where: { id: dto.sponsorId }
		})

		if (!existingSponsor) throw new NotFoundException('Sponsor not found')

		return this.prisma.festivalSponsorDiscountLocation.create({
			data: dto
		})
	}

	async update(id: string, dto: UpdateDiscountLocationDto) {
		const existingLocation = await this.prisma.festivalSponsorDiscountLocation.findUnique({
			where: { id }
		})

		if (!existingLocation) throw new NotFoundException('Discount location not found')

		return this.prisma.festivalSponsorDiscountLocation.update({
			where: { id },
			data: dto
		})
	}

	async delete(id: string) {
		const existingLocation = await this.prisma.festivalSponsorDiscountLocation.findUnique({
			where: { id }
		})

		if (!existingLocation) throw new NotFoundException('Discount location not found')

		return this.prisma.festivalSponsorDiscountLocation.delete({
			where: { id }
		})
	}
}
