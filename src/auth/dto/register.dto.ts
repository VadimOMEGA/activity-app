import { IsDateString, IsEmail, IsPhoneNumber, IsString, MinLength } from 'class-validator'

export class RegisterDto {
	@IsString()
	@MinLength(3)
	username!: string

	@MinLength(6)
	@IsString()
	password!: string

	@IsString()
	name!: string

	@IsEmail()
	email!: string

	@IsPhoneNumber('RO')
	phone!: string

	@IsDateString()
	birthDate!: string
}
