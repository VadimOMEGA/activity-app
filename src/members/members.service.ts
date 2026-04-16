import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { GetMembersDto } from './dto/get-members.dto'
import { FullMemberKind, MemberType, Prisma } from 'src/generated/prisma/client'
import { UpdateMemberDto } from './dto/update-member.dto'

@Injectable()
export class MembersService {
	constructor(private prisma: PrismaService) {}

	getAll(dto: GetMembersDto) {
		const where: Prisma.MemberWhereInput = {}

		if (dto.memberType === MemberType.ASPIRING) {
			where.aspiringMember = { isNot: null }
		}

		if (dto.memberType === MemberType.FULL) {
			where.fullMember = dto.fullMemberKind
				? { is: { fullMemberKind: dto.fullMemberKind } }
				: { isNot: null }
		}

		return this.prisma.member.findMany({
			where,
			include: {
				profile: true,
				aspiringMember: true,
				fullMember: true,
				membershipFees: true
			}
		})
	}

	async getById(id: string) {
		const member = await this.prisma.member.findUnique({
			where: { id },
			include: {
				profile: true,
				aspiringMember: true,
				fullMember: true,
				membershipFees: true
			}
		})

		if (!member) throw new NotFoundException('Member not found')

		return member
	}

	async update(id: string, dto: UpdateMemberDto) {
		const member = await this.prisma.member.findUnique({
			where: { id },
			include: {
				aspiringMember: true,
				fullMember: true
			}
		})

		if (!member) throw new NotFoundException('Member not found')

		const currentMemberType = member.fullMember ? MemberType.FULL : MemberType.ASPIRING
		const nextMemberType = dto.memberType ?? currentMemberType

		if (dto.fullMemberKind && nextMemberType !== MemberType.FULL) {
			throw new BadRequestException('fullMemberKind can be used only for FULL members')
		}

		const nextFullMemberKind = dto.fullMemberKind ?? member.fullMember?.fullMemberKind
		const isFeeLiable =
			nextMemberType === MemberType.FULL && nextFullMemberKind === FullMemberKind.REGULAR

		if (nextMemberType === MemberType.FULL && !nextFullMemberKind) {
			throw new BadRequestException('fullMemberKind is required when memberType is FULL')
		}

		await this.prisma.$transaction(async (tx) => {
			if (dto.joinedAt) {
				await tx.member.update({
					where: { id },
					data: {
						joinedAt: new Date(dto.joinedAt)
					}
				})
			}

			if (currentMemberType === MemberType.ASPIRING && nextMemberType === MemberType.FULL) {
				await tx.aspiringMember.delete({ where: { memberId: id } })
				await tx.fullMember.create({
					data: {
						memberId: id,
						fullMemberKind: nextFullMemberKind!
					}
				})
			} else if (currentMemberType === MemberType.FULL && nextMemberType === MemberType.ASPIRING) {
				await tx.fullMember.delete({ where: { memberId: id } })
				await tx.aspiringMember.create({
					data: {
						memberId: id
					}
				})
			} else if (nextMemberType === MemberType.FULL && dto.fullMemberKind) {
				await tx.fullMember.update({
					where: { memberId: id },
					data: {
						fullMemberKind: dto.fullMemberKind
					}
				})
			}

			if (!isFeeLiable) {
				await tx.membershipFee.deleteMany({
					where: { memberId: id }
				})
			}
		})

		return this.getById(id)
	}

	// This method is used to sync the Member entity based on whether the user has the MEMBER role or not.
	async syncMemberEntity(tx: Prisma.TransactionClient, profileId: string, hasMemberRole: boolean) {
		if (!hasMemberRole) {
			await tx.member.deleteMany({ where: { profileId } })
			return
		}

		const existingMember = await tx.member.findUnique({
			where: { profileId }
		})

		if (existingMember) return

		await tx.member.create({
			data: {
				profileId,
				aspiringMember: {
					create: {}
				}
			}
		})
	}
}
