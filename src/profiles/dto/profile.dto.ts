import {
	IsDateString,
	IsEmail,
	IsPhoneNumber,
	IsString,
	MaxLength,
	MinLength
} from 'class-validator'

export class ProfileDto {
	@IsString()
	@MinLength(2)
	@MaxLength(50)
	name!: string

	@IsEmail()
	email!: string

	@IsPhoneNumber('RO')
	phone!: string

	@IsDateString()
	birthDate!: Date
}
