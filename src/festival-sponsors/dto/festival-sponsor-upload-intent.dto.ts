import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator'
import { SponsorshipLevel, SponsorshipType } from 'src/generated/prisma/enums'

export class FestivalSponsorUploadIntentDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	name!: string

	@IsEnum(SponsorshipType)
	type!: SponsorshipType

	@IsEnum(SponsorshipLevel)
	level!: SponsorshipLevel

	@IsUrl()
	@IsNotEmpty()
	website!: string

	@IsString()
	@IsNotEmpty()
	originalFileName!: string

	@IsOptional()
	@IsString()
	contentType?: string
}
