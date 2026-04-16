import { Module } from '@nestjs/common'
import { DojoMentorsService } from './dojo-mentor.service'
import { DojoMentorsController } from './dojo-mentor.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [DojoMentorsController],
	providers: [DojoMentorsService, PrismaService],
	exports: [DojoMentorsService]
})
export class DojoMentorsModule {}
