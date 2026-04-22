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
import { FesivalLocationsService } from './fesival-locations.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { FestivalLocationDto } from './dto/festival-location.dto'
import { UpdateFestivalLocationDto } from './dto/update-festival-location.dto'

@Controller('fesival-locations')
export class FesivalLocationsController {
	constructor(private readonly fesivalLocationsService: FesivalLocationsService) {}

	@HttpCode(200)
	@Auth('ADMIN')
	@Get('edition/:editionId')
	async getAllByEditionId(@Param('editionId') editionId: string) {
		return this.fesivalLocationsService.getAllByEditionId(editionId)
	}

	@HttpCode(200)
	@Auth('ADMIN')
	@Get(':id')
	async getById(@Param('id') id: string) {
		return this.fesivalLocationsService.getById(id)
	}

	@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
	@HttpCode(200)
	@Auth('ADMIN')
	@Post()
	async create(@Body() dto: FestivalLocationDto) {
		return this.fesivalLocationsService.create(dto)
	}

	@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
	@HttpCode(200)
	@Auth('ADMIN')
	@Put(':id')
	async update(@Param('id') id: string, @Body() dto: UpdateFestivalLocationDto) {
		return this.fesivalLocationsService.update(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	async delete(@Param('id') id: string) {
		return this.fesivalLocationsService.delete(id)
	}
}
