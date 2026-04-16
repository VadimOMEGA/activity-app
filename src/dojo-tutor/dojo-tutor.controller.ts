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
import { DojoTutorService } from './dojo-tutor.service'
import { DojoTutorDto } from './dto/dojo-tutor.dto'

@Controller('dojo-tutor')
export class DojoTutorController {
	constructor(private readonly dojoTutorService: DojoTutorService) {}

	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll() {
		return this.dojoTutorService.getAll()
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(@Param('id') id: string) {
		return this.dojoTutorService.getById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post()
	@Auth('ADMIN')
	create(@Body() dto: DojoTutorDto) {
		return this.dojoTutorService.create(dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	delete(@Param('id') id: string) {
		return this.dojoTutorService.delete(id)
	}
}
