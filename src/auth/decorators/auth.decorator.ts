import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'

import { RoleName } from 'src/generated/prisma/enums'

import { JwtAuthGuard } from '../guards/jwt.guard'
import { RolesGuard } from '../guards/roles.guard'

export const AUTH_KEY = 'roles'

export const Auth = (...roles: RoleName[]) =>
	applyDecorators(SetMetadata(AUTH_KEY, roles), UseGuards(JwtAuthGuard, RolesGuard))
