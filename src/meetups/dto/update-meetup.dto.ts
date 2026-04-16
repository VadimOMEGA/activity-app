import { PartialType } from '@nestjs/mapped-types'
import { AntiWorkshopMeetupDto, MeetupDto, WorkshopMeetupDto } from './meetup.dto'

export class UpdateMeetupDto extends PartialType(MeetupDto) {}

export class UpdateWorkshopMeetupDto extends PartialType(WorkshopMeetupDto) {}

export class UpdateAntiWorkshopMeetupDto extends PartialType(AntiWorkshopMeetupDto) {}
