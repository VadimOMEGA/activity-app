import { Controller } from '@nestjs/common';
import { GeneralAssembliesService } from './general-assemblies.service';

@Controller('general-assemblies')
export class GeneralAssembliesController {
  constructor(private readonly generalAssembliesService: GeneralAssembliesService) {}
}
