import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { FestivalActivityDto } from './dto/festival-activity.dto'
import { UpdateFestivalActivityDto } from './dto/update-festival-activity.dto'

@Injectable()
export class FestivalActivitiesService {
	constructor(private readonly prisma: PrismaService) {}

	async getAllBySectionId(sectionId: string) {
		return this.prisma.festivalActivity.findMany({
			where: { sectionId: sectionId },
			include: { festivalPrograms: true }
		})
	}

	async getById(id: string) {
		const activity = await this.prisma.festivalActivity.findUnique({
			where: { id },
			include: { festivalPrograms: true }
		})

		if (!activity) throw new NotFoundException('Festival activity not found')

		return activity
	}

	async create(dto: FestivalActivityDto) {
		const section = await this.prisma.festivalSection.findUnique({ where: { id: dto.sectionId } })

		if (!section) throw new NotFoundException('Festival section not found')

		return this.prisma.festivalActivity.create({ data: dto })
	}

	async update(id: string, dto: UpdateFestivalActivityDto) {
		const activity = await this.prisma.festivalActivity.findUnique({ where: { id } })

		if (!activity) throw new NotFoundException('Festival activity not found')

		return this.prisma.festivalActivity.update({ where: { id }, data: dto })
	}

	async delete(id: string) {
		const activity = await this.prisma.festivalActivity.findUnique({ where: { id } })

		if (!activity) throw new NotFoundException('Festival activity not found')

		return this.prisma.festivalActivity.delete({ where: { id } })
	}
}
