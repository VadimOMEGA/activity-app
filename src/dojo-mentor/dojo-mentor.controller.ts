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
import { DojoMentorService } from './dojo-mentor.service'
import { UpdateDojoMentorDto } from './dto/update-dojo-mentor.dto'

@Controller('dojo-mentor')
export class DojoMentorController {
	constructor(private readonly dojoMentorService: DojoMentorService) {}

	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll() {
		return this.dojoMentorService.getAll()
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(@Param('id') id: string) {
		return this.dojoMentorService.getById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Put(':id')
	@Auth('ADMIN')
	update(@Param('id') id: string, @Body() dto: UpdateDojoMentorDto) {
		return this.dojoMentorService.update(id, dto)
	}
}
