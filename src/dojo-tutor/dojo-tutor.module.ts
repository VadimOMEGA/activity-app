import { Module } from '@nestjs/common'
import { DojoTutorsService } from './dojo-tutor.service'
import { DojoTutorsController } from './dojo-tutor.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [DojoTutorsController],
	providers: [DojoTutorsService, PrismaService]
})
export class DojoTutorsModule {}
