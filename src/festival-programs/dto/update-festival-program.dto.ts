import { OmitType, PartialType } from '@nestjs/mapped-types'
import { FestivalProgramDto } from './festival-program.dto'

export class UpdateFestivalProgramDto extends OmitType(PartialType(FestivalProgramDto), [
	'activityId',
	'editionId'
]) {}
