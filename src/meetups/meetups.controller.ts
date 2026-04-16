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
import { MeetupsService } from './meetups.service'
import { GetMeetupsDto } from './dto/get-meetups.dto'
import { AntiWorkshopMeetupDto, WorkshopMeetupDto } from './dto/meetup.dto'
import { UpdateAntiWorkshopMeetupDto, UpdateWorkshopMeetupDto } from './dto/update-meetup.dto'

@Controller('meetups')
export class MeetupsController {
	constructor(private readonly meetupsService: MeetupsService) {}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll(@Body() dto: GetMeetupsDto) {
		return this.meetupsService.getAll(dto)
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(@Param('id') id: string) {
		return this.meetupsService.getById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post('workshop')
	@Auth('ADMIN')
	createWorkshop(@Body() dto: WorkshopMeetupDto) {
		return this.meetupsService.createWorkshop(dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post('anti-workshop')
	@Auth('ADMIN')
	createAntiWorkshop(@Body() dto: AntiWorkshopMeetupDto) {
		return this.meetupsService.createAntiWorkshop(dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Put('workshop/:id')
	@Auth('ADMIN')
	updateWorkshop(@Param('id') id: string, @Body() dto: UpdateWorkshopMeetupDto) {
		return this.meetupsService.updateWorkshop(id, dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Put('anti-workshop/:id')
	@Auth('ADMIN')
	updateAntiWorkshop(@Param('id') id: string, @Body() dto: UpdateAntiWorkshopMeetupDto) {
		return this.meetupsService.updateAntiWorkshop(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	delete(@Param('id') id: string) {
		return this.meetupsService.delete(id)
	}
}
