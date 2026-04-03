/* eslint-disable */

import { PassportStrategy } from '@nestjs/passport'
import { Injectable } from '@nestjs/common'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private configService: ConfigService,
		private userService: UsersService
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>('JWT_SECRET') as string
		})
	}

	async validate({ id }: { id: string }) {
		return this.userService.getById(id)
	}
}
