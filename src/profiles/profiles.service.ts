import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'

import { RoleName } from 'src/generated/prisma/enums'
import { PrismaService } from 'src/prisma.service'
import { ProfileDto } from './dto/profile.dto'
import { UpdateProfileDto } from './dto/update-profile.dto'

@Injectable()
export class ProfilesService {
	constructor(private prisma: PrismaService) {}

	getAll() {
		return this.prisma.profile.findMany({
			where: {
				NOT: {
					user: {
						roles: {
							some: {
								role: {
									name: RoleName.ADMIN
								}
							}
						}
					}
				}
			},
			include: {
				member: true,
				dojoMentor: true,
				dojoTutor: true,
				dojoNinja: true
			}
		})
	}

	async getById(id: string) {
		const profile = await this.prisma.profile.findUnique({ where: { id } })
		if (!profile) throw new NotFoundException('Profile not found')
		return profile
	}

	create(dto: ProfileDto) {
		const profile = {
			name: dto.name,
			email: dto.email,
			phone: dto.phone,
			birthDate: dto.birthDate
		}

		return this.prisma.profile.create({ data: profile })
	}

	async update(id: string, dto: UpdateProfileDto, actorId?: string) {
		if (!actorId) throw new UnauthorizedException('Missing authenticated user')

		const existingProfile = await this.prisma.profile.findUnique({
			where: { id },
			select: {
				id: true,
				user: {
					select: {
						id: true
					}
				}
			}
		})
		if (!existingProfile || !existingProfile.user) throw new NotFoundException('Profile not found')

		const canManage = await this.canManageProfile(actorId, existingProfile.user.id)
		if (!canManage) throw new ForbiddenException('You can edit only your own profile')

		if (!dto || Object.keys(dto).length === 0)
			throw new BadRequestException('No data provided for update')

		if (dto.email) {
			const existingEmailProfile = await this.prisma.profile.findUnique({
				where: { email: dto.email }
			})

			if (existingEmailProfile && existingEmailProfile.id !== id)
				throw new BadRequestException('Email already in use')
		}

		return this.prisma.profile.update({
			where: { id },
			data: {
				birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
				phone: dto.phone,
				name: dto.name,
				email: dto.email
			}
		})
	}

	private async canManageProfile(actorId: string, targetUserId: string) {
		if (actorId === targetUserId) return true

		const actor = await this.prisma.user.findUnique({
			where: { id: actorId },
			select: {
				roles: {
					select: {
						role: {
							select: {
								name: true
							}
						}
					}
				}
			}
		})

		if (!actor) return false

		return actor.roles.some((userRole) => userRole.role.name === RoleName.ADMIN)
	}
}
