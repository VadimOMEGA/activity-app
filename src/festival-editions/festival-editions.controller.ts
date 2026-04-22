import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { FestivalEditionsService } from './festival-editions.service'
import { FestivalEditionDto } from './dto/festival-edition.dto'
import { UpdateFestivalEditionDto } from './dto/update-festival-edition.dto'

@Controller('festival-editions')
export class FestivalEditionsController {
	constructor(private readonly festivalEditionsService: FestivalEditionsService) {}

	@Post()
	create(@Body() dto: FestivalEditionDto) {
		return this.festivalEditionsService.create(dto)
	}

	@Get()
	getAll() {
		return this.festivalEditionsService.getAll()
	}

	@Get(':id')
	getById(@Param('id') id: string) {
		return this.festivalEditionsService.getById(id)
	}

	@Get('full/:id')
	getByIdFull(@Param('id') id: string) {
		return this.festivalEditionsService.getByIdFull(id)
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() dto: UpdateFestivalEditionDto) {
		return this.festivalEditionsService.update(id, dto)
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.festivalEditionsService.delete(id)
	}
}
