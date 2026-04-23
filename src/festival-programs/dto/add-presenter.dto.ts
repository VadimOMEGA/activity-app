import { IsNotEmpty, IsString } from 'class-validator'

export class AddPresenterDto {
	@IsString()
	@IsNotEmpty()
	guestId!: string
}
