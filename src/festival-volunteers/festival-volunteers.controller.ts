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
import { FestivalVolunteersService } from './festival-volunteers.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { FestivalVolunteerDto } from './dto/festival-volunteer.dto'

@Controller('festival-volunteers')
export class FestivalVolunteersController {
	constructor(private readonly festivalVolunteersService: FestivalVolunteersService) {}

	@HttpCode(200)
	@Auth('ADMIN')
	@Get('/edition/:editionId')
	async getAllByEditionId(@Param('editionId') editionId: string) {
		return this.festivalVolunteersService.getAllByEditionId(editionId)
	}

	@HttpCode(200)
	@Auth('ADMIN')
	@Get(':id')
	async getById(@Param('id') id: string) {
		return this.festivalVolunteersService.getById(id)
	}

	@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
	@HttpCode(201)
	@Auth('ADMIN')
	@Post()
	async create(@Body() dto: FestivalVolunteerDto) {
		return this.festivalVolunteersService.create(dto)
	}

	@Delete(':id')
	@HttpCode(200)
	@Auth('ADMIN')
	async delete(@Param('id') id: string) {
		return this.festivalVolunteersService.delete(id)
	}
}
