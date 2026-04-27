import { IsInt, IsString, MaxLength, IsOptional } from 'class-validator'

export class FestivalEditionGalleryPhotoDto {
	@IsString()
	@IsOptional()
	@MaxLength(255)
	photoFile?: string

	@IsString()
	@MaxLength(500)
	caption: string

	@IsInt()
	sortOrder: number
}
