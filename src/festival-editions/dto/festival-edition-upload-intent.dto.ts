import {
	IsInt,
	IsNotEmpty,
	IsString,
	IsArray,
	ValidateNested,
	IsOptional,
	IsIn
} from 'class-validator'
import { Type } from 'class-transformer'

export class FileUploadIntentItemDto {
	@IsString()
	@IsNotEmpty()
	@IsIn(['logo', 'hero', 'secondary', 'accent', 'video'])
	role!: string

	@IsString()
	@IsNotEmpty()
	originalFileName!: string

	@IsOptional()
	@IsString()
	contentType?: string
}

export class FestivalEditionUploadIntentDto {
	@IsInt()
	@IsNotEmpty()
	year!: number

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => FileUploadIntentItemDto)
	files!: FileUploadIntentItemDto[]
}
