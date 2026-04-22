import { GuestRole } from 'src/generated/prisma/enums'
import { IsArray, IsEnum } from 'class-validator'

export class UpdateGuestRolesDto {
	@IsArray()
	@IsEnum(GuestRole, { each: true })
	roles!: GuestRole[]
}
