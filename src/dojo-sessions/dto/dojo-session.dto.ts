import { IsDateString, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class DojoSessionDto {
	@IsDateString()
	startsAt!: Date

	@IsString()
	@IsNotEmpty()
	@MinLength(2)
	@MaxLength(255)
	location!: string

	@IsString()
	@IsNotEmpty()
	@MinLength(2)
	@MaxLength(255)
	theme!: string

	@IsString()
	@IsNotEmpty()
	mentorId!: string
}
