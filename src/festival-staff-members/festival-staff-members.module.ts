import { Module } from '@nestjs/common'
import { FestivalStaffMembersService } from './festival-staff-members.service'
import { FestivalStaffMembersController } from './festival-staff-members.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [FestivalStaffMembersController],
	providers: [FestivalStaffMembersService, PrismaService]
})
export class FestivalStaffMembersModule {}
