import { IsNotEmpty, IsString } from 'class-validator'
import { ProfileDto } from 'src/profiles/dto/profile.dto'

export class FestivalVolunteerDto extends ProfileDto {
	@IsString()
	@IsNotEmpty()
	editionId: string
}
