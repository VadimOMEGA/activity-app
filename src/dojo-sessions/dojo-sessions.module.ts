import { Module } from '@nestjs/common'
import { DojoSessionsService } from './dojo-sessions.service'
import { DojoSessionsController } from './dojo-sessions.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [DojoSessionsController],
	providers: [DojoSessionsService, PrismaService]
})
export class DojoSessionsModule {}
