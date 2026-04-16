import { Equals, IsEnum, IsOptional, ValidateIf } from 'class-validator'
import { MeetupType, WorkshopTheme } from 'src/generated/prisma/enums'

export class GetMeetupsDto {
	@ValidateIf((o: GetMeetupsDto) => o.meetupType !== undefined || o.workshopTheme !== undefined)
	@IsEnum(MeetupType)
	@ValidateIf((o: GetMeetupsDto) => o.workshopTheme !== undefined)
	@Equals(MeetupType.WORKSHOP, {
		message: 'meetupType must be WORKSHOP when workshopTheme is provided'
	})
	meetupType?: MeetupType

	@IsOptional()
	@ValidateIf((o: GetMeetupsDto) => o.meetupType === MeetupType.WORKSHOP)
	@IsEnum(WorkshopTheme)
	workshopTheme?: WorkshopTheme
}
