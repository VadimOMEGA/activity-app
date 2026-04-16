import { Module } from '@nestjs/common'
import { MeetupsService } from './meetups.service'
import { MeetupsController } from './meetups.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [MeetupsController],
	providers: [MeetupsService, PrismaService]
})
export class MeetupsModule {}
