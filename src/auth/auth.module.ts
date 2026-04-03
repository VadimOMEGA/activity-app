import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { getJwtConfig } from 'src/config/jwt.config'
import { UsersModule } from 'src/users/users.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'
import { PrismaService } from 'src/prisma.service'

@Module({
	imports: [
		ConfigModule,
		UsersModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig
		})
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, PrismaService]
})
export class AuthModule {}
