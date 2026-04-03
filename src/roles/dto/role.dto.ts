import { ArrayMinSize, IsArray, IsEnum } from 'class-validator'
import { RoleName } from 'src/generated/prisma/enums'

export class RoleDto {
	@IsEnum(RoleName)
	roleName!: RoleName
}

export class RolesAssignDto {
	@IsArray()
	@ArrayMinSize(1)
	@IsEnum(RoleName, { each: true })
	roleNames!: RoleName[]
}
