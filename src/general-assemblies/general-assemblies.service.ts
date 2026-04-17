import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { GeneralAssemblyDto } from './dto/general-assembly.dto'
import { UpdateGeneralAssemblyDto } from './dto/update-general-assembly.dto'
import { AddAttendeeDto } from './dto/add-attendee.dto'

@Injectable()
export class GeneralAssembliesService {
	constructor(private readonly prisma: PrismaService) {}

	getAll() {
		return this.prisma.generalAssembly.findMany({
			include: {
				generalAssemblyAttendees: true
			},
			orderBy: {
				heldAt: 'desc'
			}
		})
	}

	async getById(id: string) {
		const generalAssembly = await this.prisma.generalAssembly.findUnique({
			where: { id },
			include: {
				generalAssemblyAttendees: true
			}
		})

		if (!generalAssembly) {
			throw new NotFoundException('General assembly not found')
		}
		return generalAssembly
	}

	async create(dto: GeneralAssemblyDto) {
		const heldAt = new Date(dto.heldAt)
		const announcedAt = new Date(dto.announcedAt)

		if (heldAt < announcedAt) {
			throw new BadRequestException('heldAt must be greater than or equal to announcedAt')
		}

		return this.prisma.generalAssembly.create({
			data: {
				year: dto.year,
				announcedAt,
				heldAt,
				location: dto.location,
				minQuorum: dto.minQuorum
			}
		})
	}

	async update(id: string, dto: UpdateGeneralAssemblyDto) {
		const existing = await this.prisma.generalAssembly.findUnique({
			where: { id }
		})

		if (!existing) {
			throw new NotFoundException('General assembly not found')
		}

		if (!dto || Object.keys(dto).length === 0) {
			throw new BadRequestException('No data provided for update')
		}

		if (dto.heldAt && dto.announcedAt) {
			const heldAt = new Date(dto.heldAt)
			const announcedAt = new Date(dto.announcedAt)
			if (heldAt < announcedAt) {
				throw new BadRequestException('heldAt must be greater than or equal to announcedAt')
			}
		}

		return this.prisma.generalAssembly.update({
			where: { id },
			data: {
				year: dto.year,
				announcedAt: dto.announcedAt ? new Date(dto.announcedAt) : undefined,
				heldAt: dto.heldAt ? new Date(dto.heldAt) : undefined,
				location: dto.location,
				minQuorum: dto.minQuorum
			}
		})
	}

	async addAttendee(generalAssemblyId: string, dto: AddAttendeeDto) {
		const generalAssembly = await this.prisma.generalAssembly.findUnique({
			where: { id: generalAssemblyId }
		})

		if (!generalAssembly) throw new NotFoundException('General assembly not found')

		const member = await this.prisma.member.findUnique({
			where: { id: dto.memberId }
		})

		if (!member) throw new NotFoundException('Member not found')

		return this.prisma.generalAssemblyAttendee.create({
			data: {
				assemblyId: generalAssemblyId,
				memberId: dto.memberId
			}
		})
	}

	async delete(id: string) {
		const existing = await this.prisma.generalAssembly.findUnique({
			where: { id }
		})

		if (!existing) {
			throw new NotFoundException('General assembly not found')
		}

		return this.prisma.generalAssembly.delete({
			where: { id }
		})
	}
}
