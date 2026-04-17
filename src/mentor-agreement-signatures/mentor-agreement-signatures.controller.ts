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
import { MentorAgreementSignaturesService } from './mentor-agreement-signatures.service'
import { MentorAgreementSignatureDto } from './dto/mentor-agreement-signature.dto'

@Controller('mentor-agreement-signatures')
export class MentorAgreementSignaturesController {
	constructor(
		private readonly mentorAgreementSignaturesService: MentorAgreementSignaturesService
	) {}

	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll() {
		return this.mentorAgreementSignaturesService.getAll()
	}

	@HttpCode(200)
	@Get('mentor/:mentorId')
	@Auth('ADMIN')
	getAllByMentorId(@Param('mentorId') mentorId: string) {
		return this.mentorAgreementSignaturesService.getAllByMentorId(mentorId)
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(@Param('id') id: string) {
		return this.mentorAgreementSignaturesService.getById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post()
	@Auth('ADMIN')
	create(@Body() dto: MentorAgreementSignatureDto) {
		return this.mentorAgreementSignaturesService.create(dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	delete(@Param('id') id: string) {
		return this.mentorAgreementSignaturesService.delete(id)
	}
}
