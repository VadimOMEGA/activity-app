import { Module } from '@nestjs/common'
import { FestivalProgramsService } from './festival-programs.service'
import { FestivalProgramsController } from './festival-programs.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [FestivalProgramsController],
	providers: [FestivalProgramsService, PrismaService]
})
export class FestivalProgramsModule {}
