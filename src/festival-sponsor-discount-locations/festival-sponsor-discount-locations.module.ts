import { Module } from '@nestjs/common'
import { FestivalSponsorDiscountLocationsService } from './festival-sponsor-discount-locations.service'
import { FestivalSponsorDiscountLocationsController } from './festival-sponsor-discount-locations.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [FestivalSponsorDiscountLocationsController],
	providers: [FestivalSponsorDiscountLocationsService, PrismaService]
})
export class FestivalSponsorDiscountLocationsModule {}
