import { PartialType } from '@nestjs/mapped-types'
import { GeneralAssemblyDto } from './general-assembly.dto'

export class UpdateGeneralAssemblyDto extends PartialType(GeneralAssemblyDto) {}
