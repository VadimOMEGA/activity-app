import { Module } from '@nestjs/common'
import { DojoTutorService } from './dojo-tutor.service'
import { DojoTutorController } from './dojo-tutor.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [DojoTutorController],
	providers: [DojoTutorService, PrismaService]
})
export class DojoTutorModule {}
