import { IsNotEmpty, IsString } from 'class-validator'

export class AddRedeemingDto {
	@IsString()
	@IsNotEmpty()
	ticketId!: string

	@IsString()
	@IsNotEmpty()
	discountLocationId!: string
}
