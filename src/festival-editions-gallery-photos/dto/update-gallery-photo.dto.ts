import { IsInt, IsNotEmpty, IsString, MaxLength, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateGalleryPhotoCaptionDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(500)
	caption: string
}

export class ReorderGalleryPhotoItemDto {
	@IsString()
	@IsNotEmpty()
	id: string

	@IsInt()
	@IsNotEmpty()
	sortOrder: number
}

export class ReorderGalleryPhotosDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ReorderGalleryPhotoItemDto)
	items: ReorderGalleryPhotoItemDto[]
}
