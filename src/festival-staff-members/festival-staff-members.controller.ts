import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
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

	@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
	@HttpCode(201)
	@Auth('ADMIN')
	@Post()
	async create(@Body() dto: StaffMemberDto) {
		return this.festivalStaffMembersService.create(dto)
	}

	@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
	@HttpCode(200)
	@Auth('ADMIN')
	@Delete()
	async delete(@Body() dto: StaffMemberDto) {
		return this.festivalStaffMembersService.delete(dto)
	}
}
