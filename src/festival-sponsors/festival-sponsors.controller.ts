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
import { FestivalSponsorsService } from './festival-sponsors.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { FestivalSponsorUploadIntentDto } from './dto/festival-sponsor-upload-intent.dto'
import { FestivalSponsorDto } from './dto/festival-sponsor.dto'

@Controller('festival-sponsors')
export class FestivalSponsorsController {
	constructor(private readonly festivalSponsorsService: FestivalSponsorsService) {}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post('/edition/:editionId/upload-intents')
	@Auth('ADMIN')
	createUploadIntents(
		@Param('editionId') editionId: string,
		@Body() dto: FestivalSponsorUploadIntentDto
	) {
		return this.festivalSponsorsService.createUploadIntent(editionId, dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post()
	@Auth('ADMIN')
	create(@Body() dto: FestivalSponsorDto) {
		return this.festivalSponsorsService.create(dto)
	}

	@HttpCode(200)
	@Get('/edition/:editionId')
	@Auth('ADMIN')
	getAllByEditionId(@Param('editionId') editionId: string) {
		return this.festivalSponsorsService.getAllByEditionId(editionId)
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(@Param('id') id: string) {
		return this.festivalSponsorsService.getById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Put(':id')
	@Auth('ADMIN')
	update(@Param('id') id: string, @Body() dto: FestivalSponsorDto) {
		return this.festivalSponsorsService.update(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	delete(@Param('id') id: string) {
		return this.festivalSponsorsService.delete(id)
	}
}
