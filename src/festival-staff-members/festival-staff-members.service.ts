import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { StaffMemberDto } from './dto/staff-member.dto'

@Injectable()
export class FestivalStaffMembersService {
	constructor(private readonly prisma: PrismaService) {}

	async getAllByEditionId(editionId: string) {
		return this.prisma.festivalStaffMember.findMany({
			where: {
				editionId
			},
			include: {
				member: {
					include: {
						profile: true
					}
				}
			}
		})
	}

	async create(dto: StaffMemberDto) {
		const edition = await this.prisma.festivalEdition.findUnique({
			where: { id: dto.editionId }
		})

		if (!edition) {
			throw new NotFoundException('Edition not found')
		}

		const member = await this.prisma.member.findUnique({
			where: { id: dto.memberId }
		})

		if (!member) {
			throw new NotFoundException('Member not found')
		}

		return this.prisma.festivalStaffMember.create({
			data: dto
		})
	}

	async delete(dto: StaffMemberDto) {
		const edition = await this.prisma.festivalEdition.findUnique({
			where: { id: dto.editionId }
		})

		if (!edition) {
			throw new NotFoundException('Edition not found')
		}

		const member = await this.prisma.member.findUnique({
			where: { id: dto.memberId }
		})

		if (!member) {
			throw new NotFoundException('Member not found')
		}

		return this.prisma.festivalStaffMember.delete({
			where: {
				editionId_memberId: dto
			}
		})
	}
}
