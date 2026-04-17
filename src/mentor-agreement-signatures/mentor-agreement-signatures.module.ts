import { Module } from '@nestjs/common'
import { MentorAgreementSignaturesService } from './mentor-agreement-signatures.service'
import { MentorAgreementSignaturesController } from './mentor-agreement-signatures.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [MentorAgreementSignaturesController],
	providers: [MentorAgreementSignaturesService, PrismaService]
})
export class MentorAgreementSignaturesModule {}
