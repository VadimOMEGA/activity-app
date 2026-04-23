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
import { Auth } from 'src/auth/decorators/auth.decorator'
import { FestivalLocationDto } from './dto/festival-location.dto'
import { UpdateFestivalLocationDto } from './dto/update-festival-location.dto'
import { FestivalLocationsService } from './festival-locations.service'

@Controller('festival-locations')
export class FestivalLocationsController {
	constructor(private readonly festivalLocationsService: FestivalLocationsService) {}

	@HttpCode(200)
	@Auth('ADMIN')
	@Get('edition/:editionId')
	async getAllByEditionId(@Param('editionId') editionId: string) {
		return this.festivalLocationsService.getAllByEditionId(editionId)
	}

	@HttpCode(200)
	@Auth('ADMIN')
	@Get(':id')
	async getById(@Param('id') id: string) {
		return this.festivalLocationsService.getById(id)
	}

	@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
	@HttpCode(200)
	@Auth('ADMIN')
	@Post()
	async create(@Body() dto: FestivalLocationDto) {
		return this.festivalLocationsService.create(dto)
	}

	@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
	@HttpCode(200)
	@Auth('ADMIN')
	@Put(':id')
	async update(@Param('id') id: string, @Body() dto: UpdateFestivalLocationDto) {
		return this.festivalLocationsService.update(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	async delete(@Param('id') id: string) {
		return this.festivalLocationsService.delete(id)
	}
}
