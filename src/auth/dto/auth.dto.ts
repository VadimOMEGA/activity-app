import { IsString, MinLength } from 'class-validator'

export class AuthDto {
	@IsString()
	@MinLength(3)
	username!: string

	@MinLength(6)
	@IsString()
	password!: string
}

export class ResetPasswordDto {
	@IsString()
	@MinLength(6)
	oldPassword!: string

	@IsString()
	@MinLength(6)
	newPassword!: string
}

export class ChangeUsernameDto {
	@IsString()
	@MinLength(3)
	username!: string
}
