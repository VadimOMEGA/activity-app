import {
	Body,
	Controller,
	HttpCode,
	Post,
	Req,
	Res,
	UnauthorizedException,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import type { Request, Response } from 'express'

import { AuthService } from './auth.service'
import { AuthDto } from './dto/auth.dto'
import { RegisterDto } from './dto/register.dto'
import { Auth } from './decorators/auth.decorator'

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post('login')
	async login(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
		const { refreshToken, ...response } = await this.authService.login(dto)

		this.authService.addRefreshTokenToResponse(res, refreshToken)

		return response
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post('register')
	async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
		const { refreshToken, ...response } = await this.authService.register(dto)

		this.authService.addRefreshTokenToResponse(res, refreshToken)

		return response
	}

	@HttpCode(200)
	@Post('login/refresh')
	async getNewTokens(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const cookies: unknown = req.cookies
		const refreshTokenRaw =
			typeof cookies === 'object' && cookies !== null
				? (cookies as Record<string, unknown>)[this.authService.REFRESH_TOKEN_NAME]
				: undefined

		if (typeof refreshTokenRaw !== 'string' || refreshTokenRaw.length === 0) {
			throw new UnauthorizedException('Refresh token not found in cookies')
		}

		const { refreshToken, ...response } = await this.authService.getNewTokens(refreshTokenRaw)

		this.authService.addRefreshTokenToResponse(res, refreshToken)

		return response
	}

	@HttpCode(200)
	@Post('logout')
	@Auth()
	logout(@Res({ passthrough: true }) res: Response) {
		this.authService.removeRefreshTokenFromResponse(res)

		return { message: 'Logged out successfully' }
	}
}
