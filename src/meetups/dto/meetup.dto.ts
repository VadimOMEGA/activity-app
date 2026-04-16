import { IsDateString, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'
import { WorkshopTheme } from 'src/generated/prisma/enums'

export class MeetupDto {
	@IsDateString()
	startsAt!: Date

	@IsString()
	@IsNotEmpty()
	@MinLength(2)
	@MaxLength(255)
	location!: string
}

export class WorkshopMeetupDto extends MeetupDto {
	@IsString()
	@MinLength(3)
	@MaxLength(150)
	title!: string

	@IsEnum(WorkshopTheme)
	theme!: WorkshopTheme

	@IsString()
	@IsNotEmpty()
	presenterId!: string
}

export class AntiWorkshopMeetupDto extends MeetupDto {
	@IsString()
	@MinLength(3)
	@MaxLength(5000)
	agenda!: string
}
