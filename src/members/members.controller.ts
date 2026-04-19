import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	Put,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { MembersService } from './members.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { GetMembersDto } from './dto/get-members.dto'
import { UpdateMemberDto } from './dto/update-member.dto'

@Controller('members')
export class MembersController {
	constructor(private readonly membersService: MembersService) {}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll(@Body() dto: GetMembersDto) {
		return this.membersService.getAll(dto)
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(@Param('id') id: string) {
		return this.membersService.getById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Put(':id')
	@Auth('ADMIN')
	update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
		return this.membersService.update(id, dto)
	}
}
