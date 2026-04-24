import { IsNotEmpty, IsString } from 'class-validator'

export class PresenterDto {
	@IsString()
	@IsNotEmpty()
	guestId!: string
}
