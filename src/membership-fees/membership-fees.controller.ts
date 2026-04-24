import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { MembershipFeesService } from './membership-fees.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { MembershipFeeDto } from './dto/fee.dto'

@Controller('membership-fees')
export class MembershipFeesController {
	constructor(private readonly membershipFeesService: MembershipFeesService) {}

	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll() {
		return this.membershipFeesService.getAll()
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(@Param('id') id: string) {
		return this.membershipFeesService.getById(id)
	}

	@HttpCode(200)
	@Get('member/:memberId')
	@Auth('ADMIN')
	getAllByMemberId(@Param('memberId') memberId: string) {
		return this.membershipFeesService.getAllByMemberId(memberId)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(201)
	@Post()
	@Auth('ADMIN')
	create(@Body() dto: MembershipFeeDto) {
		return this.membershipFeesService.create(dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Put(':id')
	@Auth('ADMIN')
	update(@Param('id') id: string, @Body() dto: MembershipFeeDto) {
		return this.membershipFeesService.update(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	delete(@Param('id') id: string) {
		return this.membershipFeesService.delete(id)
	}
}
