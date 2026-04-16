import { Module } from '@nestjs/common'
import { DojoNinjasService } from './dojo-ninjas.service'
import { DojoNinjasController } from './dojo-ninjas.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [DojoNinjasController],
	providers: [DojoNinjasService, PrismaService]
})
export class DojoNinjasModule {}
