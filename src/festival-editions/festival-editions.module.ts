import { Module } from '@nestjs/common'
import { FestivalEditionsService } from './festival-editions.service'
import { FestivalEditionsController } from './festival-editions.controller'
import { PrismaService } from 'src/prisma.service'
import { S3Module } from 'src/s3/s3.module'

@Module({
	imports: [S3Module],
	controllers: [FestivalEditionsController],
	providers: [FestivalEditionsService, PrismaService]
})
export class FestivalEditionsModule {}
