import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { FestivalGuestDto } from './dto/festival-guest.dto'
import { UpdateGuestRolesDto } from './dto/update-guest-roles.dto'

@Injectable()
export class FestivalGuestsService {
	constructor(private readonly prisma: PrismaService) {}

	async getAllByEditionId(editionId: string) {
		const edition = await this.prisma.festivalEdition.findUnique({
			where: { id: editionId }
		})

		if (!edition) throw new NotFoundException('Edition not found')

		return this.prisma.festivalGuest.findMany({
			where: { editionId },
			include: {
				profile: true,
				festivalGuestRoles: {
					select: {
						role: true
					}
				}
			}
		})
	}

	async getById(id: string) {
		const guest = await this.prisma.festivalGuest.findUnique({
			where: { id },
			include: {
				profile: true,
				festivalGuestRoles: {
					select: {
						role: true
					}
				}
			}
		})

		if (!guest) throw new NotFoundException('Guest not found')

		return guest
	}

	async create(dto: FestivalGuestDto) {
		const edition = await this.prisma.festivalEdition.findUnique({
			where: { id: dto.editionId }
		})

		if (!edition) throw new NotFoundException('Edition not found')

		const existingEmail = await this.prisma.profile.findUnique({
			where: { email: dto.email }
		})

		if (existingEmail) throw new BadRequestException('Email already exists')

		return this.prisma.festivalGuest.create({
			data: {
				edition: {
					connect: {
						id: dto.editionId
					}
				},
				profile: {
					create: {
						email: dto.email,
						name: dto.name,
						birthDate: new Date(dto.birthDate),
						phone: dto.phone
					}
				},
				festivalGuestRoles: {
					create: dto.roles.map((role) => ({
						role
					}))
				}
			}
		})
	}

	async updateRoles(guestId: string, dto: UpdateGuestRolesDto) {
		const guest = await this.prisma.festivalGuest.findUnique({
			where: { id: guestId }
		})

		if (!guest) throw new NotFoundException('Guest not found')

		return this.prisma.festivalGuest.update({
			where: { id: guestId },
			data: {
				festivalGuestRoles: {
					deleteMany: {},
					create: dto.roles.map((role) => ({
						role
					}))
				}
			}
		})
	}

	async delete(id: string) {
		const guest = await this.prisma.festivalGuest.findUnique({
			where: { id }
		})

		if (!guest) throw new NotFoundException('Guest not found')

		await this.prisma.profile.delete({
			where: { id: guest.profileId }
		})

		return { message: 'Festival guest deleted successfully' }
	}
}
