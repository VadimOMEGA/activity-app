import { Module } from '@nestjs/common'
import { DojoNinjasService } from './dojo-ninja.service'
import { DojoNinjasController } from './dojo-ninja.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [DojoNinjasController],
	providers: [DojoNinjasService, PrismaService]
})
export class DojoNinjasModule {}
