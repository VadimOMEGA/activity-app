import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Put,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { UsersService } from './users.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { ChangeUsernameDto, ResetPasswordDto } from 'src/auth/dto/auth.dto'
import { RolesAssignDto } from 'src/roles/dto/role.dto'

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll() {
		return this.usersService.getAll()
	}

	@HttpCode(200)
	@Get(':id')
	getById(@Param('id') id: string) {
		return this.usersService.getById(id)
	}

	@HttpCode(200)
	@Get('username/:username')
	getByUsername(@Param('username') username: string) {
		return this.usersService.getByUsername(username)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Put('reset-password/:id')
	@Auth()
	resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
		return this.usersService.resetPassword(id, dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Put('change-username/:id')
	@Auth()
	changeUsername(@Param('id') id: string, @Body() dto: ChangeUsernameDto) {
		return this.usersService.changeUsername(id, dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Put('roles/:id')
	@Auth('ADMIN')
	assignRoles(@Param('id') id: string, @Body() dto: RolesAssignDto) {
		return this.usersService.assignRoles(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	delete(@Param('id') id: string) {
		return this.usersService.delete(id)
	}
}
