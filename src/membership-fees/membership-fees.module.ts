import { Module } from '@nestjs/common'
import { MembershipFeesService } from './membership-fees.service'
import { MembershipFeesController } from './membership-fees.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [MembershipFeesController],
	providers: [MembershipFeesService, PrismaService]
})
export class MembershipFeesModule {}
