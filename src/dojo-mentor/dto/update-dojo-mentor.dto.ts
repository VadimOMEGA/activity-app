import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateDojoMentorDto {
	@IsOptional()
	@IsString()
	@MinLength(3)
	@MaxLength(2000)
	description?: string
}
