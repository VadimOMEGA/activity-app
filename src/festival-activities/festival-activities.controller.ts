import { Controller } from '@nestjs/common'
import { FestivalActivitiesService } from './festival-activities.service'

@Controller('festival-activities')
export class FestivalActivitiesController {
	constructor(private readonly festivalActivitiesService: FestivalActivitiesService) {}
}
