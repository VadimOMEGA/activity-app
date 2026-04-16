import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateDojoNinjaDto {
	@IsOptional()
	@IsString()
	@MinLength(3)
	@MaxLength(2000)
	usefulInfo?: string
}
