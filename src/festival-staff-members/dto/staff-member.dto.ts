import { IsNotEmpty, IsString } from 'class-validator'

export class StaffMemberDto {
	@IsString()
	@IsNotEmpty()
	editionId!: string

	@IsString()
	@IsNotEmpty()
	memberId!: string
}
