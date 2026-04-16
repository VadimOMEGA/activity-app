import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	Put,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { DojoMentorsService } from './dojo-mentor.service'
import { UpdateDojoMentorDto } from './dto/update-dojo-mentor.dto'

@Controller('dojo-mentors')
export class DojoMentorsController {
	constructor(private readonly dojoMentorsService: DojoMentorsService) {}

	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll() {
		return this.dojoMentorsService.getAll()
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(@Param('id') id: string) {
		return this.dojoMentorsService.getById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Put(':id')
	@Auth('ADMIN')
	update(@Param('id') id: string, @Body() dto: UpdateDojoMentorDto) {
		return this.dojoMentorsService.update(id, dto)
	}
}
