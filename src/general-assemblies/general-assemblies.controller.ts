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
import { GeneralAssembliesService } from './general-assemblies.service'
import { GeneralAssemblyDto } from './dto/general-assembly.dto'
import { UpdateGeneralAssemblyDto } from './dto/update-general-assembly.dto'
import { AddAttendeeDto } from './dto/add-attendee.dto'

@Controller('general-assemblies')
export class GeneralAssembliesController {
	constructor(private readonly generalAssembliesService: GeneralAssembliesService) {}

	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll() {
		return this.generalAssembliesService.getAll()
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(@Param('id') id: string) {
		return this.generalAssembliesService.getById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(201)
	@Post()
	@Auth('ADMIN')
	create(@Body() dto: GeneralAssemblyDto) {
		return this.generalAssembliesService.create(dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Put(':id')
	@Auth('ADMIN')
	update(@Param('id') id: string, @Body() dto: UpdateGeneralAssemblyDto) {
		return this.generalAssembliesService.update(id, dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(201)
	@Post(':id/attendees')
	@Auth('ADMIN')
	addAttendee(@Param('id') id: string, @Body() dto: AddAttendeeDto) {
		return this.generalAssembliesService.addAttendee(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	delete(@Param('id') id: string) {
		return this.generalAssembliesService.delete(id)
	}
}
