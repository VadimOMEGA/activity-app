import { Module } from '@nestjs/common'
import { DojoTutorsService } from './dojo-tutors.service'
import { DojoTutorsController } from './dojo-tutors.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [DojoTutorsController],
	providers: [DojoTutorsService, PrismaService]
})
export class DojoTutorsModule {}
