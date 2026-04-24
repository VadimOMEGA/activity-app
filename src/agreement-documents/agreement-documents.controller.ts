import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { AgreementDocumentsService } from './agreement-documents.service'
import { CreateAgreementDocumentUploadIntentDto } from './dto/create-agreement-document-upload-intent.dto'
import { UpdateAgreementDocumentDto } from './dto/update-agreement-document.dto'

@Controller('agreement-documents')
export class AgreementDocumentsController {
	constructor(private readonly agreementDocumentsService: AgreementDocumentsService) {}

	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll() {
		return this.agreementDocumentsService.getAll()
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(@Param('id') id: string) {
		return this.agreementDocumentsService.getById(id)
	}

	@HttpCode(200)
	@Get('slug/:slug')
	@Auth('ADMIN')
	getBySlugWithDownload(@Param('slug') slug: string) {
		return this.agreementDocumentsService.getBySlugWithDownloadUrl(slug)
	}

	@HttpCode(201)
	@Post(':id/confirm-upload')
	@Auth('ADMIN')
	confirmUpload(@Param('id') id: string) {
		return this.agreementDocumentsService.confirmUploadByDocumentId(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(201)
	@Post('create-with-upload-intent')
	@Auth('ADMIN')
	createWithUploadIntent(@Body() dto: CreateAgreementDocumentUploadIntentDto) {
		return this.agreementDocumentsService.createWithUploadIntent(dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Put(':id')
	@Auth('ADMIN')
	updateName(@Param('id') id: string, @Body() dto: UpdateAgreementDocumentDto) {
		return this.agreementDocumentsService.updateName(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	delete(@Param('id') id: string) {
		return this.agreementDocumentsService.delete(id)
	}
}
