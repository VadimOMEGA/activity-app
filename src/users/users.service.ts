import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException
} from '@nestjs/common'
import { hash, verify } from 'argon2'

import { ChangeUsernameDto, ResetPasswordDto } from 'src/auth/dto/auth.dto'
import { RegisterDto } from 'src/auth/dto/register.dto'
import { DojoMentorService } from 'src/dojo-mentor/dojo-mentor.service'
import { Prisma } from 'src/generated/prisma/client'
import { RoleName } from 'src/generated/prisma/enums'
import { MembersService } from 'src/members/members.service'
import { PrismaService } from 'src/prisma.service'
import { RolesAssignDto } from 'src/roles/dto/role.dto'

@Injectable()
export class UsersService {
	constructor(
		private prisma: PrismaService,
		private membersService: MembersService,
		private dojoMentorService: DojoMentorService
	) {}

	getAll() {
		// not the admin
		return this.prisma.user.findMany({
			where: {
				NOT: {
					roles: {
						some: {
							role: {
								name: 'ADMIN'
							}
						}
					}
				}
			},
			include: {
				profile: true,
				roles: {
					include: {
						role: true
					}
				}
			}
		})
	}

	async getById(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			include: {
				profile: true,
				roles: {
					include: {
						role: true
					}
				}
			}
		})
		if (!user) throw new NotFoundException('User not found')
		return user
	}

	async getByUsername(username: string) {
		const user = await this.prisma.user.findUnique({
			where: { username },
			include: {
				profile: true,
				roles: {
					include: {
						role: true
					}
				}
			}
		})
		if (!user) throw new NotFoundException('User not found')
		return user
	}

	getByUsernameNoThrow(username: string) {
		return this.prisma.user.findUnique({ where: { username } })
	}

	getByEmailNoThrow(email: string) {
		return this.prisma.profile.findUnique({ where: { email } })
	}

	async create(dto: RegisterDto) {
		const existingUser = await this.prisma.user.findUnique({ where: { username: dto.username } })
		if (existingUser) throw new BadRequestException('Username is already taken')

		const existingEmail = await this.prisma.profile.findUnique({ where: { email: dto.email } })
		if (existingEmail) throw new BadRequestException('Email is already taken')

		const userRole = await this.prisma.role.findUnique({
			where: { name: RoleName.USER },
			select: { id: true }
		})

		if (!userRole) {
			throw new InternalServerErrorException('USER role is missing. Run seed first')
		}

		const createdUser = await this.prisma.user.create({
			data: {
				username: dto.username,
				passwordHash: await hash(dto.password),
				profile: {
					create: {
						name: dto.name,
						email: dto.email,
						phone: dto.phone,
						birthDate: new Date(dto.birthDate)
					}
				},
				roles: {
					create: {
						role: {
							connect: {
								name: RoleName.USER
							}
						}
					}
				}
			}
		})

		return createdUser
	}

	async resetPassword(id: string, dto: ResetPasswordDto) {
		const user = await this.prisma.user.findUnique({ where: { id } })

		if (!user) throw new NotFoundException('User not found')

		const isOldPasswordValid = await verify(user.passwordHash, dto.oldPassword)

		if (!isOldPasswordValid) throw new BadRequestException('Old password is incorrect')

		if (dto.oldPassword === dto.newPassword)
			throw new BadRequestException('New password must be different from the old one')

		await this.prisma.user.update({
			where: { id },
			data: { passwordHash: await hash(dto.newPassword) }
		})

		return { message: 'Password reset successful' }
	}

	async changeUsername(id: string, dto: ChangeUsernameDto) {
		const user = await this.prisma.user.findUnique({ where: { id } })
		if (!user) throw new NotFoundException('User not found')

		if (user.username === dto.username)
			throw new BadRequestException('New username must be different from the old one')

		const newUsername = await this.prisma.user.findUnique({ where: { username: dto.username } })
		if (newUsername) throw new BadRequestException('Username is already taken')

		await this.prisma.user.update({
			where: { id },
			data: { username: dto.username }
		})

		return { message: 'Username changed successfully' }
	}

	async delete(id: string) {
		await this.prisma.$transaction(async (tx) => {
			const user = await tx.user.findUnique({
				where: { id },
				select: { profileId: true }
			})

			if (!user) return

			await tx.user.delete({
				where: { id }
			})

			await tx.profile.delete({
				where: { id: user.profileId }
			})
		})
	}

	// ============================
	// Roles assign and domain entity sync
	// ============================

	async assignRoles(userId: string, dto: RolesAssignDto) {
		const user = await this.getUserOrThrow(userId)

		const uniqueDesiredRoleNames = [...new Set(dto.roleNames)]
		const desiredRoleNames = new Set(uniqueDesiredRoleNames)

		await this.prisma.$transaction(async (tx) => {
			await tx.user.update({
				where: { id: user.id },
				data: {
					roles: {
						deleteMany: {},
						create: uniqueDesiredRoleNames.map((roleName) => ({
							role: {
								connect: {
									name: roleName
								}
							}
						}))
					}
				}
			})

			await this.syncDomainEntitiesForRoles(tx, user.profileId, desiredRoleNames)
		})

		return { message: 'Roles assigned successfully' }
	}

	private async getUserOrThrow(userId: string) {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { id: true, profileId: true }
		})
		if (!user) throw new NotFoundException('User not found')

		return user
	}

	private async syncDomainEntitiesForRoles(
		tx: Prisma.TransactionClient,
		profileId: string,
		desiredRoleNames: Set<RoleName>
	) {
		await this.membersService.syncMemberEntity(tx, profileId, desiredRoleNames.has(RoleName.MEMBER))
		await this.dojoMentorService.syncDojoMentorEntity(
			tx,
			profileId,
			desiredRoleNames.has(RoleName.MENTOR)
		)
	}
}
