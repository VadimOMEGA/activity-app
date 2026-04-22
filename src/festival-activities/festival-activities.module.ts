import { Module } from '@nestjs/common'
import { FestivalActivitiesService } from './festival-activities.service'
import { FestivalActivitiesController } from './festival-activities.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [FestivalActivitiesController],
	providers: [FestivalActivitiesService, PrismaService]
})
export class FestivalActivitiesModule {}
