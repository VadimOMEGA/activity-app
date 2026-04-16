import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { DojoTutorDto } from './dto/dojo-tutor.dto'

@Injectable()
export class DojoTutorService {
	constructor(private readonly prisma: PrismaService) {}

	getAll() {
		return this.prisma.dojoTutor.findMany({
			include: {
				profile: true,
				dojoNinjas: true
			}
		})
	}

	async getById(id: string) {
		const tutor = await this.prisma.dojoTutor.findUnique({
			where: { id },
			include: { profile: true, dojoNinjas: true }
		})

		if (!tutor) throw new NotFoundException('Dojo tutor not found')

		return tutor
	}

	async create(dto: DojoTutorDto) {
		const existingEmail = await this.prisma.profile.findUnique({
			where: { email: dto.email }
		})

		if (existingEmail) throw new BadRequestException('Email already exists')

		return this.prisma.dojoTutor.create({
			data: {
				profile: {
					create: dto
				}
			},
			include: { profile: true, dojoNinjas: true }
		})
	}

	async delete(id: string) {
		const tutor = await this.prisma.dojoTutor.findUnique({
			where: { id },
			select: { profileId: true }
		})

		if (!tutor) throw new NotFoundException('Dojo tutor not found')

		await this.prisma.profile.delete({ where: { id: tutor.profileId } })

		return { message: 'Dojo tutor deleted successfully' }
	}
}
