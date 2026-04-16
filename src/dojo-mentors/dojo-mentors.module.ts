import { Module } from '@nestjs/common'
import { DojoMentorsService } from './dojo-mentors.service'
import { DojoMentorsController } from './dojo-mentors.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [DojoMentorsController],
	providers: [DojoMentorsService, PrismaService],
	exports: [DojoMentorsService]
})
export class DojoMentorsModule {}
