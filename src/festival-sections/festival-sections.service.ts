import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { FestivalSectionDto } from './dto/festival-section.dto'
import { UpdateFestivalSectionDto } from './dto/update-festival-section.dto'

@Injectable()
export class FestivalSectionsService {
	constructor(private readonly prisma: PrismaService) {}

	getAllByEditionId(editionId: string) {
		return this.prisma.festivalSection.findMany({
			where: { editionId: editionId },
			include: { festivalActivities: true }
		})
	}

	async getById(id: string) {
		const section = await this.prisma.festivalSection.findUnique({
			where: { id },
			include: { festivalActivities: true }
		})

		if (!section) throw new NotFoundException('Festival section not found')

		return section
	}

	async create(dto: FestivalSectionDto) {
		const edition = await this.prisma.festivalEdition.findUnique({ where: { id: dto.editionId } })

		if (!edition) throw new NotFoundException('Festival edition not found')

		return this.prisma.festivalSection.create({ data: dto })
	}

	async update(id: string, dto: UpdateFestivalSectionDto) {
		const section = await this.prisma.festivalSection.findUnique({ where: { id } })

		if (!section) throw new NotFoundException('Festival section not found')

		return this.prisma.festivalSection.update({ where: { id }, data: dto })
	}

	async delete(id: string) {
		const section = await this.prisma.festivalSection.findUnique({ where: { id } })

		if (!section) throw new NotFoundException('Festival section not found')

		return this.prisma.festivalSection.delete({ where: { id } })
	}
}
