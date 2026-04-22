import { Controller } from '@nestjs/common';
import { FestivalStaffMembersService } from './festival-staff-members.service';

@Controller('festival-staff-members')
export class FestivalStaffMembersController {
  constructor(private readonly festivalStaffMembersService: FestivalStaffMembersService) {}
}
