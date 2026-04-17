import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateAgreementDocumentDto {
	@IsString()
	@IsNotEmpty()
	name!: string
}
