import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { FestivalTicketDto } from './dto/festival-ticket.dto'
import { UpdateTicketGuestCountDto } from './dto/update-ticket-guest-count.dto'
import { AddRedeemingDto } from './dto/add-redeeming.dto'

@Injectable()
export class FestivalTicketsService {
	constructor(private readonly prisma: PrismaService) {}

	async getAllByEditionId(editionId: string) {
		const existingEdition = await this.prisma.festivalEdition.findUnique({
			where: {
				id: editionId
			}
		})

		if (!existingEdition) {
			throw new NotFoundException(`Edition not found`)
		}

		return this.prisma.festivalTicket.findMany({
			where: { editionId },
			include: { festivalDiscountRedeemings: true }
		})
	}

	async getById(id: string) {
		const existingTicket = await this.prisma.festivalTicket.findUnique({
			where: {
				id
			}
		})

		if (!existingTicket) {
			throw new NotFoundException(`Ticket not found`)
		}

		return existingTicket
	}

	async create(dto: FestivalTicketDto) {
		const existingEdition = await this.prisma.festivalEdition.findUnique({
			where: { id: dto.editionId }
		})

		if (!existingEdition) {
			throw new NotFoundException('Edition not found')
		}

		const profile = await this.prisma.profile.upsert({
			where: {
				email: dto.email
			},
			create: {
				email: dto.email,
				name: dto.name,
				phone: dto.phone,
				birthDate: new Date(dto.birthDate)
			},
			update: {
				name: dto.name,
				phone: dto.phone,
				birthDate: new Date(dto.birthDate)
			}
		})

		return this.prisma.festivalTicket.create({
			data: {
				editionId: dto.editionId,
				holderProfileId: profile.id,
				guestCount: dto.guestCount
			}
		})
	}

	async addRedeeming(dto: AddRedeemingDto) {
		const existingTicket = await this.prisma.festivalTicket.findUnique({
			where: { id: dto.ticketId }
		})

		if (!existingTicket) {
			throw new NotFoundException('Ticket not found')
		}

		const existingDiscountLocation = await this.prisma.festivalSponsorDiscountLocation.findUnique({
			where: { id: dto.discountLocationId }
		})

		if (!existingDiscountLocation) {
			throw new NotFoundException('Discount location not found')
		}

		const existingRedeeming = await this.prisma.festivalDiscountRedeeming.findFirst({
			where: {
				ticketId: dto.ticketId,
				discountLocationId: dto.discountLocationId
			}
		})

		if (existingRedeeming) {
			throw new BadRequestException('This redeeming already exists for this ticket')
		}

		return this.prisma.festivalDiscountRedeeming.create({
			data: {
				ticketId: dto.ticketId,
				discountLocationId: dto.discountLocationId
			}
		})
	}

	async update(id: string, dto: UpdateTicketGuestCountDto) {
		const existingTicket = await this.prisma.festivalTicket.findUnique({
			where: { id }
		})

		if (!existingTicket) {
			throw new NotFoundException('Ticket not found')
		}

		return this.prisma.festivalTicket.update({
			where: { id },
			data: { guestCount: dto.guestCount }
		})
	}

	async delete(id: string) {
		const existingTicket = await this.prisma.festivalTicket.findUnique({
			where: { id }
		})

		if (!existingTicket) {
			throw new NotFoundException('Ticket not found')
		}

		await this.prisma.festivalTicket.delete({
			where: { id }
		})
	}
}
