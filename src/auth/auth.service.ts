import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { verify } from 'argon2'
import { Response } from 'express'

import { UsersService } from 'src/users/users.service'
import { AuthDto } from './dto/auth.dto'
import { RegisterDto } from './dto/register.dto'

@Injectable()
export class AuthService {
	public readonly REFRESH_TOKEN_NAME = 'refreshToken'
	private readonly REFRESH_TOKEN_DAYS_EXPIRATION = 7

	constructor(
		private jwt: JwtService,
		private usersService: UsersService
	) {}

	async login(dto: AuthDto) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { passwordHash, ...user } = await this.validateUser(dto)

		const tokens = this.issueTokens(user.id)

		return { user, ...tokens }
	}

	async register(dto: RegisterDto) {
		const existing = await this.usersService.getByUsernameNoThrow(dto.username)

		if (existing) throw new BadRequestException('User with such username already exists')

		const existingEmail = await this.usersService.getByEmailNoThrow(dto.email)

		if (existingEmail) throw new BadRequestException('User with such email already exists')

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { passwordHash, ...user } = await this.usersService.create(dto)

		const tokens = this.issueTokens(user.id)

		return { user, ...tokens }
	}

	// Helper methods
	private issueTokens(userId: string) {
		const data = { id: userId }
		const accessToken = this.jwt.sign(data, { expiresIn: '15m' })
		const refreshToken = this.jwt.sign(data, { expiresIn: '7d' })

		return { accessToken, refreshToken }
	}

	private async validateUser(dto: AuthDto) {
		const user = await this.usersService.getByUsername(dto.username)

		if (!user) throw new NotFoundException('User not found')

		const isValid = await verify(user.passwordHash, dto.password)

		if (!isValid) throw new NotFoundException('User with such credentials not found')

		return user
	}

	async getNewTokens(refreshToken: string) {
		const result: { id: string } = await this.jwt.verifyAsync(refreshToken)
		if (!result) throw new UnauthorizedException('Invalid refresh token')

		const { ...userRaw } = await this.usersService.getById(result.id)
		if (!userRaw) throw new NotFoundException('User not found')

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { passwordHash, ...user } = userRaw

		const tokens = this.issueTokens(user.id)

		return {
			user,
			...tokens
		}
	}

	addRefreshTokenToResponse(res: Response, refreshToken: string) {
		const expiresIn = new Date()
		expiresIn.setDate(expiresIn.getDate() + this.REFRESH_TOKEN_DAYS_EXPIRATION)

		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			expires: expiresIn,
			secure: true, // Set to true in production
			sameSite: 'none' // lax if production
		})
	}

	removeRefreshTokenFromResponse(res: Response) {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			expires: new Date(0),
			secure: true, // Set to true in production
			sameSite: 'none' // lax if production
		})
	}
}
