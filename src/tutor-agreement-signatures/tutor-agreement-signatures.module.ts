import { Module } from '@nestjs/common'
import { TutorAgreementSignaturesService } from './tutor-agreement-signatures.service'
import { TutorAgreementSignaturesController } from './tutor-agreement-signatures.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [TutorAgreementSignaturesController],
	providers: [TutorAgreementSignaturesService, PrismaService]
})
export class TutorAgreementSignaturesModule {}
