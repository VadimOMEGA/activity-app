import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { FullMemberKind } from 'src/generated/prisma/client'
import { PrismaService } from 'src/prisma.service'
import { MembershipFeeDto } from './dto/fee.dto'
import { UpdateMembershipFeeDto } from './dto/update-fee.dto'

@Injectable()
export class MembershipFeesService {
	constructor(private readonly prismaService: PrismaService) {}

	getAll() {
		return this.prismaService.membershipFee.findMany({
			include: {
				member: {
					include: {
						profile: true
					}
				}
			}
		})
	}

	async getById(id: string) {
		const fee = await this.prismaService.membershipFee.findUnique({
			where: { id },
			include: {
				member: {
					include: {
						profile: true
					}
				}
			}
		})

		if (!fee) throw new NotFoundException('Membership fee not found')

		return fee
	}

	async getAllByMemberId(memberId: string) {
		return this.prismaService.membershipFee.findMany({
			where: { memberId },
			include: {
				member: {
					include: {
						profile: true
					}
				}
			}
		})
	}

	async create(dto: MembershipFeeDto) {
		const existingMember = await this.prismaService.member.findUnique({
			where: { id: dto.memberId },
			include: {
				fullMember: true
			}
		})

		if (!existingMember) throw new NotFoundException('Member not found')

		if (
			!existingMember.fullMember ||
			existingMember.fullMember.fullMemberKind !== FullMemberKind.REGULAR
		) {
			throw new BadRequestException('Only FULL REGULAR members can have membership fees')
		}

		const existingFeeForYear = await this.prismaService.membershipFee.findUnique({
			where: {
				memberId_year: {
					memberId: dto.memberId,
					year: dto.year
				}
			}
		})

		if (existingFeeForYear) {
			throw new BadRequestException(
				`Membership fee for year ${dto.year} already exists for this member`
			)
		}

		return await this.prismaService.membershipFee.create({
			data: {
				memberId: dto.memberId,
				year: dto.year,
				amount: dto.amount,
				status: dto.status
			}
		})
	}

	async update(id: string, dto: UpdateMembershipFeeDto) {
		const existingFee = await this.prismaService.membershipFee.findUnique({
			where: { id }
		})

		if (!existingFee) throw new NotFoundException('Membership fee not found')

		return await this.prismaService.membershipFee.update({
			where: { id },
			data: {
				amount: dto.amount,
				status: dto.status
			}
		})
	}

	async delete(id: string) {
		const existingFee = await this.prismaService.membershipFee.findUnique({
			where: { id }
		})

		if (!existingFee) throw new NotFoundException('Membership fee not found')

		return await this.prismaService.membershipFee.delete({
			where: { id }
		})
	}
}
