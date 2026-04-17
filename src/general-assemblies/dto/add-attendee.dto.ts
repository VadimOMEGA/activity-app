import { IsNotEmpty, IsString } from 'class-validator'

export class AddAttendeeDto {
	@IsString()
	@IsNotEmpty()
	memberId!: string
}
