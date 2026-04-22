import {
	Controller,
	Get,
	Param,
	Patch,
	Body,
	Post,
	Delete,
	HttpCode,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { FestivalEditionsGalleryPhotosService } from './festival-editions-gallery-photos.service'
import {
	ReorderGalleryPhotosDto,
	UpdateGalleryPhotoCaptionDto
} from './dto/update-gallery-photo.dto'
import { CreateGalleryPhotoUploadIntentDto } from './dto/create-gallery-photo-upload-intent.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'

@Controller('festival-editions-gallery-photos')
export class FestivalEditionsGalleryPhotosController {
	constructor(
		private readonly festivalEditionsGalleryPhotosService: FestivalEditionsGalleryPhotosService
	) {}

	@HttpCode(200)
	@Get('edition/:editionId')
	@Auth('ADMIN')
	getAllByEditionId(@Param('editionId') editionId: string) {
		return this.festivalEditionsGalleryPhotosService.getAllByEditionId(editionId)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post('edition/:editionId/upload-intent')
	@Auth('ADMIN')
	createWithUploadIntent(
		@Param('editionId') editionId: string,
		@Body() dto: CreateGalleryPhotoUploadIntentDto
	) {
		return this.festivalEditionsGalleryPhotosService.createWithUploadIntent(editionId, dto)
	}

	@HttpCode(200)
	@Post(':id/confirm-upload')
	@Auth('ADMIN')
	confirmUploadById(@Param('id') id: string) {
		return this.festivalEditionsGalleryPhotosService.confirmUploadById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Patch('reorder')
	@Auth('ADMIN')
	reorder(@Body() dto: ReorderGalleryPhotosDto) {
		return this.festivalEditionsGalleryPhotosService.reorder(dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Patch(':id/caption')
	@Auth('ADMIN')
	updateCaption(@Param('id') id: string, @Body() dto: UpdateGalleryPhotoCaptionDto) {
		return this.festivalEditionsGalleryPhotosService.updateCaption(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	remove(@Param('id') id: string) {
		return this.festivalEditionsGalleryPhotosService.delete(id)
	}
}
