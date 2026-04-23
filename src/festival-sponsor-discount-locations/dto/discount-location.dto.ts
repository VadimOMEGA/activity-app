import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator'

export class DiscountLocationDto {
	@IsString()
	@IsNotEmpty()
	sponsorId!: string

	@IsString()
	@IsNotEmpty()
	name!: string

	@IsString()
	@IsNotEmpty()
	address!: string

	@IsInt()
	@Min(0)
	@Max(100)
	discountPercent!: number

	@IsInt()
	@Min(1)
	redeemMax!: number
}
