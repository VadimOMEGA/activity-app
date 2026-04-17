import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { TutorAgreementSignaturesService } from './tutor-agreement-signatures.service'
import { TutorAgreementSignatureDto } from './dto/tutor-agreement-signature.dto'

@Controller('tutor-agreement-signatures')
export class TutorAgreementSignaturesController {
	constructor(private readonly tutorAgreementSignaturesService: TutorAgreementSignaturesService) {}

	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll() {
		return this.tutorAgreementSignaturesService.getAll()
	}

	@HttpCode(200)
	@Get('tutor/:tutorId')
	@Auth('ADMIN')
	getAllByTutorId(@Param('tutorId') tutorId: string) {
		return this.tutorAgreementSignaturesService.getAllByTutorId(tutorId)
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(@Param('id') id: string) {
		return this.tutorAgreementSignaturesService.getById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post()
	@Auth('ADMIN')
	create(@Body() dto: TutorAgreementSignatureDto) {
		return this.tutorAgreementSignaturesService.create(dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	delete(@Param('id') id: string) {
		return this.tutorAgreementSignaturesService.delete(id)
	}
}
