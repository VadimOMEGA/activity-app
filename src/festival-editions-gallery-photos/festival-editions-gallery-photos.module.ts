import { Module } from '@nestjs/common'
import { FestivalEditionsGalleryPhotosService } from './festival-editions-gallery-photos.service'
import { FestivalEditionsGalleryPhotosController } from './festival-editions-gallery-photos.controller'
import { PrismaService } from 'src/prisma.service'
import { S3Module } from 'src/s3/s3.module'

@Module({
	imports: [S3Module],
	controllers: [FestivalEditionsGalleryPhotosController],
	providers: [FestivalEditionsGalleryPhotosService, PrismaService]
})
export class FestivalEditionsGalleryPhotosModule {}
