import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	Put,
	Req,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import type { Request } from 'express'

import { Auth } from 'src/auth/decorators/auth.decorator'
import { ProfilesService } from './profiles.service'
import { UpdateProfileDto } from './dto/update-profile.dto'

type AuthenticatedRequest = Request & {
	user?: {
		id?: string
	}
}

@Controller('profiles')
export class ProfilesController {
	constructor(private readonly profilesService: ProfilesService) {}

	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll() {
		return this.profilesService.getAll()
	}

	@HttpCode(200)
	@Get(':id')
	getById(@Param('id') id: string) {
		return this.profilesService.getById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Auth()
	@Put(':id')
	update(@Param('id') id: string, @Body() dto: UpdateProfileDto, @Req() req: AuthenticatedRequest) {
		return this.profilesService.update(id, dto, req.user?.id)
	}
}
