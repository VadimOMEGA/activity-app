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
import { FestivalSectionsService } from './festival-sections.service'
import { FestivalSectionDto } from './dto/festival-section.dto'
import { UpdateFestivalSectionDto } from './dto/update-festival-section.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'

@Controller('festival-sections')
export class FestivalSectionsController {
	constructor(private readonly festivalSectionsService: FestivalSectionsService) {}

	@HttpCode(200)
	@Get('edition/:id')
	@Auth('ADMIN')
	getAllByEditionId(@Param('id') id: string) {
		return this.festivalSectionsService.getAllByEditionId(id)
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(@Param('id') id: string) {
		return this.festivalSectionsService.getById(id)
	}

	@UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
	@HttpCode(201)
	@Post()
	@Auth('ADMIN')
	create(@Body() dto: FestivalSectionDto) {
		return this.festivalSectionsService.create(dto)
	}

	@UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
	@HttpCode(200)
	@Put(':id')
	@Auth('ADMIN')
	update(@Param('id') id: string, @Body() dto: UpdateFestivalSectionDto) {
		return this.festivalSectionsService.update(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	delete(@Param('id') id: string) {
		return this.festivalSectionsService.delete(id)
	}
}
