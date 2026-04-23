import { IsDateString, IsNotEmpty, IsString } from 'class-validator'

export class FestivalProgramDto {
	@IsString()
	@IsNotEmpty()
	editionId!: string

	@IsString()
	@IsNotEmpty()
	locationId!: string

	@IsString()
	@IsNotEmpty()
	activityId!: string

	@IsDateString()
	@IsNotEmpty()
	startsAt!: string

	@IsDateString()
	@IsNotEmpty()
	endsAt!: string
}
