import { Module } from '@nestjs/common'
import { FestivalGuestsService } from './festival-guests.service'
import { FestivalGuestsController } from './festival-guests.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [FestivalGuestsController],
	providers: [FestivalGuestsService, PrismaService]
})
export class FestivalGuestsModule {}
