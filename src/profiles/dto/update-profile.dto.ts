import { ProfileDto } from './profile.dto'
import { PartialType } from '@nestjs/mapped-types'

export class UpdateProfileDto extends PartialType(ProfileDto) {}
