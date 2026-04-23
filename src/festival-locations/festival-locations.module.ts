import { Module } from '@nestjs/common'
import { FestivalLocationsService } from './festival-locations.service'
import { FestivalLocationsController } from './festival-locations.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [FestivalLocationsController],
	providers: [FestivalLocationsService, PrismaService]
})
export class FestivalLocationsModule {}
