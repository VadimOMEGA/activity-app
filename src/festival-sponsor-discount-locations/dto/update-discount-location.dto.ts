import { OmitType, PartialType } from '@nestjs/mapped-types'
import { DiscountLocationDto } from './discount-location.dto'

export class UpdateDiscountLocationDto extends OmitType(PartialType(DiscountLocationDto), [
	'sponsorId'
] as const) {}
