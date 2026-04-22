import { Injectable } from '@nestjs/common'
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
		return this.prisma.festivalStaffMember.create({
			data: dto
		})
	}

	async delete(dto: StaffMemberDto) {
		return this.prisma.festivalStaffMember.delete({
			where: {
				editionId_memberId: dto
			}
		})
	}
}
