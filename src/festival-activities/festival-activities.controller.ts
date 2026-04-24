import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put } from '@nestjs/common'
import { FestivalActivitiesService } from './festival-activities.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { FestivalActivityDto } from './dto/festival-activity.dto'
import { UpdateFestivalActivityDto } from './dto/update-festival-activity.dto'

@Controller('festival-activities')
export class FestivalActivitiesController {
	constructor(private readonly festivalActivitiesService: FestivalActivitiesService) {}

	@HttpCode(200)
	@Auth('ADMIN')
	@Get('section/:sectionId')
	async getAllBySectionId(@Param('sectionId') sectionId: string) {
		return this.festivalActivitiesService.getAllBySectionId(sectionId)
	}

	@HttpCode(200)
	@Auth('ADMIN')
	@Get(':id')
	async getById(@Param('id') id: string) {
		return this.festivalActivitiesService.getById(id)
	}

	@HttpCode(201)
	@Auth('ADMIN')
	@Post()
	async create(@Body() dto: FestivalActivityDto) {
		return this.festivalActivitiesService.create(dto)
	}

	@HttpCode(200)
	@Auth('ADMIN')
	@Put(':id')
	async update(@Param('id') id: string, @Body() dto: UpdateFestivalActivityDto) {
		return this.festivalActivitiesService.update(id, dto)
	}

	@HttpCode(200)
	@Auth('ADMIN')
	@Delete(':id')
	async delete(@Param('id') id: string) {
		return this.festivalActivitiesService.delete(id)
	}
}
