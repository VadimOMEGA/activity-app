import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException
} from '@nestjs/common'
import { hash, verify } from 'argon2'

import { ChangeUsernameDto, ResetPasswordDto } from 'src/auth/dto/auth.dto'
import { RegisterDto } from 'src/auth/dto/register.dto'
import { PrismaService } from 'src/prisma.service'
import { RolesAssignDto } from 'src/roles/dto/role.dto'

@Injectable()
export class UsersService {
	constructor(private prisma: PrismaService) {}

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
		try {
			const user = await this.prisma.user.create({
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
					}
				}
			})

			return user
		} catch (error) {
			const maybeCode =
				typeof error === 'object' && error !== null && 'code' in error
					? (error as { code?: string }).code
					: undefined

			if (maybeCode === 'P2002') {
				throw new BadRequestException('Username or email already exists')
			}

			throw new InternalServerErrorException('Failed to create user')
		}
	}

	async assignRoles(userId: string, dto: RolesAssignDto) {
		const user = await this.prisma.user.findUnique({ where: { id: userId } })
		if (!user) throw new NotFoundException('User not found')

		const roles = await this.prisma.role.findMany({
			where: { name: { in: dto.roleNames } }
		})

		if (roles.length !== dto.roleNames.length) {
			throw new BadRequestException('Some roles do not exist')
		}

		await this.prisma.user.update({
			where: { id: userId },
			data: {
				roles: {
					deleteMany: {},
					create: roles.map((role) => ({ roleId: role.id }))
				}
			}
		})

		return { message: 'Roles assigned successfully' }
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
}
