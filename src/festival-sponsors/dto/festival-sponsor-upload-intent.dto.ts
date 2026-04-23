import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class FestivalSponsorUploadIntentDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	name!: string

	@IsString()
	@IsNotEmpty()
	originalFileName!: string

	@IsOptional()
	@IsString()
	contentType?: string
}
