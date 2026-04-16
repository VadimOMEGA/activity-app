import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { DojoNinjaDto } from './dto/dojo-ninja.dto'
import { UpdateDojoNinjaDto } from './dto/update-dojo-ninja.dto'

@Injectable()
export class DojoNinjaService {
	constructor(private readonly prisma: PrismaService) {}

	getAll() {
		return this.prisma.dojoNinja.findMany({
			include: {
				profile: true
			}
		})
	}

	async getById(id: string) {
		const ninja = await this.prisma.dojoNinja.findUnique({
			where: { id },
			include: {
				profile: true
			}
		})

		if (!ninja) throw new NotFoundException('Dojo ninja not found')

		return ninja
	}

	async getAllByTutorId(tutorId: string) {
		return this.prisma.dojoNinja.findMany({
			where: { tutorId },
			include: {
				profile: true
			}
		})
	}

	async create(dto: DojoNinjaDto) {
		const tutor = await this.prisma.dojoTutor.findUnique({
			where: { id: dto.tutorId },
			select: { id: true }
		})

		if (!tutor) throw new BadRequestException('Tutor not found')

		const existingEmail = await this.prisma.profile.findUnique({
			where: { email: dto.email }
		})

		if (existingEmail) throw new BadRequestException('Email already exists')

		return this.prisma.dojoNinja.create({
			data: {
				tutor: {
					connect: { id: dto.tutorId }
				},
				usefulInfo: dto.usefulInfo,
				profile: {
					create: {
						email: dto.email,
						name: dto.name,
						phone: dto.phone,
						birthDate: new Date(dto.birthDate)
					}
				}
			},
			include: { profile: true }
		})
	}

	async update(id: string, dto: UpdateDojoNinjaDto) {
		const ninja = await this.prisma.dojoNinja.findUnique({
			where: { id }
		})

		if (!ninja) throw new NotFoundException('Dojo ninja not found')

		if (!dto || Object.keys(dto).length === 0)
			throw new BadRequestException('No data provided for update')

		return this.prisma.dojoNinja.update({
			where: { id },
			data: {
				usefulInfo: dto.usefulInfo
			},
			include: { profile: true }
		})
	}

	async delete(id: string) {
		const ninja = await this.prisma.dojoNinja.findUnique({
			where: { id },
			select: { profileId: true }
		})

		if (!ninja) throw new NotFoundException('Dojo ninja not found')

		await this.prisma.profile.delete({ where: { id: ninja.profileId } })

		return { message: 'Dojo ninja deleted successfully' }
	}
}
