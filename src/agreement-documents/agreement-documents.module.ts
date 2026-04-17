import { Module } from '@nestjs/common'
import { AgreementDocumentsService } from './agreement-documents.service'
import { AgreementDocumentsController } from './agreement-documents.controller'
import { S3Module } from 'src/s3/s3.module'
import { PrismaService } from 'src/prisma.service'

@Module({
	imports: [S3Module],
	controllers: [AgreementDocumentsController],
	providers: [AgreementDocumentsService, PrismaService]
})
export class AgreementDocumentsModule {}
