import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { AgreementDocumentDto } from './agreement-document.dto'

export class CreateAgreementDocumentUploadIntentDto extends AgreementDocumentDto {
	@IsString()
	@IsNotEmpty()
	originalFileName!: string

	@IsOptional()
	@IsString()
	@IsNotEmpty()
	contentType?: string
}
