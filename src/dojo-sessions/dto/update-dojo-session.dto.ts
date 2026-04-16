import { PartialType } from '@nestjs/mapped-types'
import { DojoSessionDto } from './dojo-session.dto'

export class UpdateDojoSessionDto extends PartialType(DojoSessionDto) {}
