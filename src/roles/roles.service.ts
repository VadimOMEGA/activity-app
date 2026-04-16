import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class RolesService {
	constructor(private prisma: PrismaService) {}

	getAll() {
		return this.prisma.role.findMany()
	}
}
