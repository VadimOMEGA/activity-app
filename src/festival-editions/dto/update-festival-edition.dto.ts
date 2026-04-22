import { PartialType } from '@nestjs/mapped-types'
import { FestivalEditionDto } from './festival-edition.dto'

export class UpdateFestivalEditionDto extends PartialType(FestivalEditionDto) {}
