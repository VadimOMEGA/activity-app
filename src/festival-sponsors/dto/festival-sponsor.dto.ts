import { IsEnum, IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator'
import { SponsorshipLevel, SponsorshipType } from 'src/generated/prisma/enums'

export class FestivalSponsorDto {
	@IsString()
	@IsNotEmpty()
	editionId!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	name!: string

	@IsEnum(SponsorshipType)
	type!: SponsorshipType

	@IsEnum(SponsorshipLevel)
	level!: SponsorshipLevel

	@IsString()
	@IsNotEmpty()
	logoFile!: string

	@IsUrl()
	@IsNotEmpty()
	website!: string
}
