import { Controller, Get, HttpCode } from '@nestjs/common'
import { RolesService } from './roles.service'
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
}
