import { Module } from '@nestjs/common'
import { FesivalLocationsService } from './fesival-locations.service'
import { FesivalLocationsController } from './fesival-locations.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [FesivalLocationsController],
	providers: [FesivalLocationsService, PrismaService]
})
export class FesivalLocationsModule {}
