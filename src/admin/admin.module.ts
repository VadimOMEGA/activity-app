import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { AdminController } from './admin.controller'
import { AdminUsersController } from './admin-users.controller'
import { AdminMembersController } from './admin-members.controller'
import { AdminMeetupsController } from './admin-meetups.controller'
import { AdminDojoController } from './admin-dojo.controller'
import { AdminAgreementsController } from './admin-agreements.controller'
import { AdminAssembliesController } from './admin-assemblies.controller'
import { AdminAuthGuard } from './guards/admin-auth.guard'
import { PrismaService } from 'src/prisma.service'

@Module({
	imports: [
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: (config: ConfigService) => ({
				secret: config.get<string>('JWT_SECRET'),
				signOptions: { expiresIn: '15m' }
			}),
			inject: [ConfigService]
		})
	],
	controllers: [
		AdminController,
		AdminUsersController,
		AdminMembersController,
		AdminMeetupsController,
		AdminDojoController,
		AdminAgreementsController,
		AdminAssembliesController
	],
	providers: [AdminAuthGuard, PrismaService],
	exports: [AdminAuthGuard, JwtModule]
})
export class AdminModule {}
