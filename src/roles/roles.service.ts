import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { RoleDto } from './dto/role.dto'

@Injectable()
export class RolesService {
	constructor(private prisma: PrismaService) {}

	getAll() {
		return this.prisma.role.findMany()
	}

	async create(dto: RoleDto) {
		const existingRole = await this.prisma.role.findUnique({ where: { name: dto.roleName } })
		if (existingRole) throw new BadRequestException('Role with this name already exists')

		return this.prisma.role.create({ data: { name: dto.roleName } })
	}

	async delete(id: string) {
		const role = await this.prisma.role.findUnique({ where: { id } })
		if (!role) throw new BadRequestException('Role not found')

		if (role.name === 'ADMIN') {
			throw new BadRequestException('Cannot delete this role')
		}

		await this.prisma.role.delete({ where: { id } })

		return { message: 'Role deleted successfully' }
	}
}
