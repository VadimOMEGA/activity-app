import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { FestivalEditionDto } from './dto/festival-edition.dto'
import { UpdateFestivalEditionDto } from './dto/update-festival-edition.dto'

@Injectable()
export class FestivalEditionsService {
	constructor(private readonly prisma: PrismaService) {}

	getAll() {
		return this.prisma.festivalEdition.findMany()
	}

	async getById(id: string) {
		const festivalEdition = await this.prisma.festivalEdition.findUnique({
			where: { id },
			include: {
				blogTag: true
			}
		})

		if (!festivalEdition) throw new NotFoundException('Festival edition not found')

		return festivalEdition
	}

	async getByIdFull(id: string) {
		const festivalEdition = await this.prisma.festivalEdition.findUnique({
			where: { id },
			include: {
				festivalEditionGalleryPhotos: {
					orderBy: { sortOrder: 'asc' }
				},
				festivalSections: true,
				festivalPrograms: true,
				festivalVolunteers: true,
				festivalStaffMembers: true,
				festivalTickets: true,
				festivalSponsors: true,
				festivalGuests: true,
				festivalLocations: true,
				blogTag: true
			}
		})

		if (!festivalEdition) throw new NotFoundException('Festival edition not found')

		return festivalEdition
	}

	async create(dto: FestivalEditionDto) {
		const existingYear = await this.prisma.festivalEdition.findUnique({
			where: { year: dto.year }
		})

		if (existingYear)
			throw new BadRequestException('Festival edition with this year already exists')

		return this.prisma.festivalEdition.create({ data: dto })
	}

	async update(id: string, dto: UpdateFestivalEditionDto) {
		const existingEdition = await this.prisma.festivalEdition.findUnique({
			where: { id }
		})

		if (!existingEdition) throw new NotFoundException('Festival edition not found')

		if (dto.year) {
			const existingYear = await this.prisma.festivalEdition.findFirst({
				where: {
					year: dto.year,
					NOT: { id }
				}
			})

			if (existingYear)
				throw new BadRequestException('Festival edition with this year already exists')
		}

		return this.prisma.festivalEdition.update({
			where: { id },
			data: dto
		})
	}

	async delete(id: string) {
		const existingEdition = await this.prisma.festivalEdition.findUnique({
			where: { id }
		})

		if (!existingEdition) throw new NotFoundException('Festival edition not found')

		return this.prisma.festivalEdition.delete({ where: { id } })
	}
}
