import { ActivityAudienceType, FestivalActivityType } from 'src/generated/prisma/enums'
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class FestivalActivityDto {
	@IsString()
	@IsNotEmpty()
	sectionId!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	title!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(5000)
	description!: string

	@IsEnum(ActivityAudienceType)
	audience!: ActivityAudienceType

	@IsEnum(FestivalActivityType)
	activityType!: FestivalActivityType
}
