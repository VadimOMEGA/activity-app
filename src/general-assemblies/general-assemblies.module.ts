import { Module } from '@nestjs/common';
import { GeneralAssembliesService } from './general-assemblies.service';
import { GeneralAssembliesController } from './general-assemblies.controller';

@Module({
  controllers: [GeneralAssembliesController],
  providers: [GeneralAssembliesService],
})
export class GeneralAssembliesModule {}
