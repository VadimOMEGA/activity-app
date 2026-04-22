import { Module } from '@nestjs/common'
import { FestivalVolunteersService } from './festival-volunteers.service'
import { FestivalVolunteersController } from './festival-volunteers.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [FestivalVolunteersController],
	providers: [FestivalVolunteersService, PrismaService]
})
export class FestivalVolunteersModule {}
