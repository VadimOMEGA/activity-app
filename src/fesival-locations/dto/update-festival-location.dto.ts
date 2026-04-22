import { OmitType, PartialType } from '@nestjs/mapped-types'
import { FestivalLocationDto } from './festival-location.dto'

export class UpdateFestivalLocationDto extends OmitType(PartialType(FestivalLocationDto), [
	'editionId'
]) {}
