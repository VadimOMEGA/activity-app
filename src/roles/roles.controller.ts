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
import { RolesService } from './roles.service'
import { RoleDto } from './dto/role.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'

@Controller('roles')
export class RolesController {
	constructor(private readonly rolesService: RolesService) {}

	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll() {
		return this.rolesService.getAll()
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post()
	@Auth('ADMIN')
	create(@Body() dto: RoleDto) {
		return this.rolesService.create(dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	delete(@Param('id') id: string) {
		return this.rolesService.delete(id)
	}
}
