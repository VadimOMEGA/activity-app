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
import { DojoNinjaService } from './dojo-ninja.service'
import { DojoNinjaDto } from './dto/dojo-ninja.dto'
import { UpdateDojoNinjaDto } from './dto/update-dojo-ninja.dto'

@Controller('dojo-ninja')
export class DojoNinjaController {
	constructor(private readonly dojoNinjaService: DojoNinjaService) {}

	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll() {
		return this.dojoNinjaService.getAll()
	}

	@HttpCode(200)
	@Get('tutor/:tutorId')
	@Auth('ADMIN')
	getAllByTutorId(@Param('tutorId') tutorId: string) {
		return this.dojoNinjaService.getAllByTutorId(tutorId)
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(@Param('id') id: string) {
		return this.dojoNinjaService.getById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post()
	@Auth('ADMIN')
	create(@Body() dto: DojoNinjaDto) {
		return this.dojoNinjaService.create(dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Put(':id')
	@Auth('ADMIN')
	update(@Param('id') id: string, @Body() dto: UpdateDojoNinjaDto) {
		return this.dojoNinjaService.update(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	delete(@Param('id') id: string) {
		return this.dojoNinjaService.delete(id)
	}
}
