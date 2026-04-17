import { IsNotEmpty, IsString } from 'class-validator'

export class TutorAgreementSignatureDto {
	@IsString()
	@IsNotEmpty()
	tutorId!: string

	@IsString()
	@IsNotEmpty()
	documentId!: string
}
