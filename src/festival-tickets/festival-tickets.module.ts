import { Module } from '@nestjs/common'
import { FestivalTicketsService } from './festival-tickets.service'
import { FestivalTicketsController } from './festival-tickets.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [FestivalTicketsController],
	providers: [FestivalTicketsService, PrismaService]
})
export class FestivalTicketsModule {}
