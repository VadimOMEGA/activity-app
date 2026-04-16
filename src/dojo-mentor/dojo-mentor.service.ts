import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from 'src/generated/prisma/client'
import { PrismaService } from 'src/prisma.service'
import { UpdateDojoMentorDto } from './dto/update-dojo-mentor.dto'

@Injectable()
export class DojoMentorService {
	constructor(private readonly prisma: PrismaService) {}

	getAll() {
		return this.prisma.dojoMentor.findMany({
			include: {
				profile: true
			}
		})
	}

	async getById(id: string) {
		const mentor = await this.prisma.dojoMentor.findUnique({
			where: { id },
			include: { profile: true }
		})

		if (!mentor) throw new NotFoundException('Dojo mentor not found')

		return mentor
	}

	async update(id: string, dto: UpdateDojoMentorDto) {
		const mentor = await this.prisma.dojoMentor.findUnique({
			where: { id }
		})

		if (!mentor) throw new NotFoundException('Dojo mentor not found')

		if (!dto || Object.keys(dto).length === 0)
			throw new BadRequestException('No data provided for update')

		return this.prisma.dojoMentor.update({
			where: { id },
			data: dto,
			include: { profile: true }
		})
	}

	// This method is used to sync the DojoMentor entity based on whether the user has the MENTOR role or not.
	async syncDojoMentorEntity(
		tx: Prisma.TransactionClient,
		profileId: string,
		hasMentorRole: boolean
	) {
		if (!hasMentorRole) {
			await tx.dojoMentor.deleteMany({ where: { profileId } })
			return
		}

		const existingMentor = await tx.dojoMentor.findUnique({
			where: { profileId }
		})

		if (existingMentor) return

		await tx.dojoMentor.create({
			data: {
				profileId,
				description: 'To be defined' // Provide a default description or require it to be specified
			}
		})
	}
}
