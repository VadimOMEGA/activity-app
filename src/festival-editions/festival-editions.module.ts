import { Module } from '@nestjs/common'
import { FestivalEditionsService } from './festival-editions.service'
import { FestivalEditionsController } from './festival-editions.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [FestivalEditionsController],
	providers: [FestivalEditionsService, PrismaService]
})
export class FestivalEditionsModule {}
