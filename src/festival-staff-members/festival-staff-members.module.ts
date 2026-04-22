import { Module } from '@nestjs/common';
import { FestivalStaffMembersService } from './festival-staff-members.service';
import { FestivalStaffMembersController } from './festival-staff-members.controller';

@Module({
  controllers: [FestivalStaffMembersController],
  providers: [FestivalStaffMembersService],
})
export class FestivalStaffMembersModule {}
