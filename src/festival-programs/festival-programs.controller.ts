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
import { FestivalProgramsService } from './festival-programs.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { FestivalProgramDto } from './dto/festival-program.dto'
import { UpdateFestivalProgramDto } from './dto/update-festival-program.dto'
import { AddPresenterDto } from './dto/add-presenter.dto'

@Controller('festival-programs')
export class FestivalProgramsController {
	constructor(private readonly festivalProgramsService: FestivalProgramsService) {}

	@HttpCode(200)
	@Auth('ADMIN')
	@Get('edition/:editionId')
	getAllByEditionId(@Param('editionId') editionId: string) {
		return this.festivalProgramsService.getAllByEditionId(editionId)
	}

	@HttpCode(200)
	@Auth('ADMIN')
	@Get(':id')
	getById(@Param('id') id: string) {
		return this.festivalProgramsService.getById(id)
	}

	@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
	@HttpCode(200)
	@Auth('ADMIN')
	@Post()
	create(@Param('editionId') @Body() dto: FestivalProgramDto) {
		return this.festivalProgramsService.create(dto)
	}

	@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
	@HttpCode(200)
	@Auth('ADMIN')
	@Put('/edition/:editionId/program/:programId')
	update(
		@Param('editionId') editionId: string,
		@Param('programId') programId: string,
		@Body() dto: UpdateFestivalProgramDto
	) {
		return this.festivalProgramsService.update(programId, editionId, dto)
	}

	@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
	@HttpCode(200)
	@Auth('ADMIN')
	@Post(':programId/presenters')
	addPresenter(@Param('programId') programId: string, @Body() dto: AddPresenterDto) {
		return this.festivalProgramsService.addPresenter(programId, dto)
	}

	@HttpCode(200)
	@Auth('ADMIN')
	@Delete(':programId')
	delete(@Param('programId') programId: string) {
		return this.festivalProgramsService.delete(programId)
	}
}
