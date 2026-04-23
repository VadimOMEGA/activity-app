import { OmitType, PartialType } from '@nestjs/mapped-types'
import { FestivalSponsorDto } from './festival-sponsor.dto'

export class UpdateFestivalSponsorDto extends OmitType(PartialType(FestivalSponsorDto), [
	'editionId'
] as const) {}
