import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { FestivalEditionGalleryPhotoDto } from './gallery-photo.dto'

export class CreateGalleryPhotoUploadIntentDto extends FestivalEditionGalleryPhotoDto {
	@IsString()
	@IsNotEmpty()
	originalFileName!: string

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	contentType?: string
}
