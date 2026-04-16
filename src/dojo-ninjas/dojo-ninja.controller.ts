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
import { DojoNinjasService } from './dojo-ninja.service'
import { DojoNinjaDto } from './dto/dojo-ninja.dto'
import { UpdateDojoNinjaDto } from './dto/update-dojo-ninja.dto'

@Controller('dojo-ninjas')
export class DojoNinjasController {
	constructor(private readonly dojoNinjasService: DojoNinjasService) {}

	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll() {
		return this.dojoNinjasService.getAll()
	}

	@HttpCode(200)
	@Get('tutor/:tutorId')
	@Auth('ADMIN')
	getAllByTutorId(@Param('tutorId') tutorId: string) {
		return this.dojoNinjasService.getAllByTutorId(tutorId)
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(@Param('id') id: string) {
		return this.dojoNinjasService.getById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post()
	@Auth('ADMIN')
	create(@Body() dto: DojoNinjaDto) {
		return this.dojoNinjasService.create(dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Put(':id')
	@Auth('ADMIN')
	update(@Param('id') id: string, @Body() dto: UpdateDojoNinjaDto) {
		return this.dojoNinjasService.update(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	delete(@Param('id') id: string) {
		return this.dojoNinjasService.delete(id)
	}
}
