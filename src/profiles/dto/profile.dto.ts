import { IsDateString, IsEmail, IsPhoneNumber, IsString } from 'class-validator'

export class ProfileDto {
	@IsString()
	name!: string

	@IsEmail()
	email!: string

	@IsPhoneNumber('RO')
	phone!: string

	@IsDateString()
	birthDate!: Date
}
