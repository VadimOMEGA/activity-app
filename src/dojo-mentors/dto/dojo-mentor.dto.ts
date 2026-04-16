import { IsString, MaxLength, MinLength } from 'class-validator'

export class DojoMentorDto {
	@IsString()
	profileId!: string

	@IsString()
	@MinLength(3)
	@MaxLength(2000)
	description!: string
}
