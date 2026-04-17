import { IsNotEmpty, IsString } from 'class-validator'

export class MentorAgreementSignatureDto {
	@IsString()
	@IsNotEmpty()
	mentorId!: string

	@IsString()
	@IsNotEmpty()
	documentId!: string
}
