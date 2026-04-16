import { Module } from '@nestjs/common'
import { DojoNinjaService } from './dojo-ninja.service'
import { DojoNinjaController } from './dojo-ninja.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [DojoNinjaController],
	providers: [DojoNinjaService, PrismaService]
})
export class DojoNinjaModule {}
