import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { ActivityAudienceType, FestivalActivityType } from 'src/generated/prisma/enums'

export class UpdateFestivalActivityDto {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	title!: string

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	@MaxLength(5000)
	description!: string

	@IsOptional()
	@IsEnum(ActivityAudienceType)
	audience!: ActivityAudienceType

	@IsOptional()
	@IsEnum(FestivalActivityType)
	activityType!: FestivalActivityType
}
