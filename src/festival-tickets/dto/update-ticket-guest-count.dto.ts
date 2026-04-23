import { IsInt, Max, Min } from 'class-validator'

export class UpdateTicketGuestCountDto {
	@IsInt()
	@Min(0)
	@Max(5)
	guestCount!: number
}
