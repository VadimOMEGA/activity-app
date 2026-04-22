import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Patch,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { FestivalGuestsService } from './festival-guests.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { FestivalGuestDto } from './dto/festival-guest.dto'
import { UpdateGuestRolesDto } from './dto/update-guest-roles.dto'

@Controller('festival-guests')
export class FestivalGuestsController {
	constructor(private readonly festivalGuestsService: FestivalGuestsService) {}

	@HttpCode(200)
	@Auth('ADMIN')
	@Get('edition/:editionId')
	async getAllByEditionId(editionId: string) {
		return this.festivalGuestsService.getAllByEditionId(editionId)
	}

	@HttpCode(200)
	@Auth('ADMIN')
	@Get(':id')
	async getById(id: string) {
		return this.festivalGuestsService.getById(id)
	}

	@UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
	@HttpCode(200)
	@Auth('ADMIN')
	@Post()
	async create(@Body() dto: FestivalGuestDto) {
		return this.festivalGuestsService.create(dto)
	}

	@UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
	@HttpCode(200)
	@Auth('ADMIN')
	@Patch(':id/roles')
	async updateRoles(id: string, @Body() dto: UpdateGuestRolesDto) {
		return this.festivalGuestsService.updateRoles(id, dto)
	}

	@HttpCode(200)
	@Auth('ADMIN')
	@Delete(':id')
	async delete(id: string) {
		return this.festivalGuestsService.delete(id)
	}
}
