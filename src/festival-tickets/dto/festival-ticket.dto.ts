import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator'
import { ProfileDto } from 'src/profiles/dto/profile.dto'

export class FestivalTicketDto extends ProfileDto {
	@IsString()
	@IsNotEmpty()
	editionId!: string

	@IsString()
	@IsNotEmpty()
	holderProfileId!: string

	@IsInt()
	@Min(0)
	@Max(5)
	guestCount!: number
}
