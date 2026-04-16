import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'
import { ProfileDto } from 'src/profiles/dto/profile.dto'

export class DojoNinjaDto extends ProfileDto {
	@IsString()
	@IsNotEmpty()
	tutorId!: string

	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(2000)
	usefulInfo!: string
}
