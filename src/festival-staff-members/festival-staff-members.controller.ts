import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common'
import { FestivalStaffMembersService } from './festival-staff-members.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { StaffMemberDto } from './dto/staff-member.dto'

@Controller('festival-staff-members')
export class FestivalStaffMembersController {
	constructor(private readonly festivalStaffMembersService: FestivalStaffMembersService) {}

	@HttpCode(200)
	@Auth('ADMIN')
	@Get('edition/:editionId')
	async getAllByEditionId(@Param('editionId') editionId: string) {
		return this.festivalStaffMembersService.getAllByEditionId(editionId)
	}

	@HttpCode(200)
	@Auth('ADMIN')
	@Post()
	async create(@Body() dto: StaffMemberDto) {
		return this.festivalStaffMembersService.create(dto)
	}

	@HttpCode(200)
	@Auth('ADMIN')
	@Delete()
	async delete(@Body() dto: StaffMemberDto) {
		return this.festivalStaffMembersService.delete(dto)
	}
}
