import { Module } from '@nestjs/common'
import { DojoMentorService } from './dojo-mentor.service'
import { DojoMentorController } from './dojo-mentor.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [DojoMentorController],
	providers: [DojoMentorService, PrismaService],
	exports: [DojoMentorService]
})
export class DojoMentorModule {}
