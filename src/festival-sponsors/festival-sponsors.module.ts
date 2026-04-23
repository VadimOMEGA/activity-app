import { Module } from '@nestjs/common'
import { FestivalSponsorsService } from './festival-sponsors.service'
import { FestivalSponsorsController } from './festival-sponsors.controller'
import { PrismaService } from 'src/prisma.service'
import { S3Module } from 'src/s3/s3.module'

@Module({
	imports: [S3Module],
	controllers: [FestivalSponsorsController],
	providers: [FestivalSponsorsService, PrismaService]
})
export class FestivalSponsorsModule {}
