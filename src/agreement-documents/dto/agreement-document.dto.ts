import { IsNotEmpty, IsString, Matches } from 'class-validator'

export class AgreementDocumentDto {
	@IsString()
	@IsNotEmpty()
	name!: string

	@IsString()
	@IsNotEmpty()
	@Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
		message:
			'Slug must be lowercase, alphanumeric, and can contain hyphens (but not start or end with them)'
	})
	slug!: string
}
