import { GuestRole } from 'src/generated/prisma/enums'
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { ProfileDto } from 'src/profiles/dto/profile.dto'

export class FestivalGuestDto extends ProfileDto {
	@IsString()
	@IsNotEmpty()
	editionId!: string

	@IsArray()
	@IsEnum(GuestRole, { each: true })
	roles!: GuestRole[]
}
