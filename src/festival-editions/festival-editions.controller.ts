import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	HttpCode,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { FestivalEditionsService } from './festival-editions.service'
import { FestivalEditionDto } from './dto/festival-edition.dto'
import { UpdateFestivalEditionDto } from './dto/update-festival-edition.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { FestivalEditionUploadIntentDto } from './dto/festival-edition-upload-intent.dto'

@Controller('festival-editions')
export class FestivalEditionsController {
	constructor(private readonly festivalEditionsService: FestivalEditionsService) {}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post('upload-intents')
	@Auth('ADMIN')
	createUploadIntents(@Body() dto: FestivalEditionUploadIntentDto) {
		return this.festivalEditionsService.createUploadIntents(dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post()
	@Auth('ADMIN')
	create(@Body() dto: FestivalEditionDto) {
		return this.festivalEditionsService.create(dto)
	}

	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll() {
		return this.festivalEditionsService.getAll()
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(@Param('id') id: string) {
		return this.festivalEditionsService.getById(id)
	}

	@HttpCode(200)
	@Get('full/:id')
	@Auth('ADMIN')
	getByIdFull(@Param('id') id: string) {
		return this.festivalEditionsService.getByIdFull(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Patch(':id')
	@Auth('ADMIN')
	update(@Param('id') id: string, @Body() dto: UpdateFestivalEditionDto) {
		return this.festivalEditionsService.update(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	remove(@Param('id') id: string) {
		return this.festivalEditionsService.delete(id)
	}
}
