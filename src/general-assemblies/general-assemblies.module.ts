import { Module } from '@nestjs/common'
import { GeneralAssembliesService } from './general-assemblies.service'
import { GeneralAssembliesController } from './general-assemblies.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [GeneralAssembliesController],
	providers: [GeneralAssembliesService, PrismaService]
})
export class GeneralAssembliesModule {}
