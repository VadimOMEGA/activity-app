import { IsString, IsDateString, IsInt, Min, Max, MinLength, MaxLength } from 'class-validator'

export class GeneralAssemblyDto {
	@IsInt()
	@Min(2020)
	@Max(2100)
	year!: number

	@IsDateString()
	announcedAt!: Date

	@IsDateString()
	heldAt!: Date

	@IsString()
	@MinLength(1)
	@MaxLength(255)
	location!: string

	@IsInt()
	@Min(1)
	minQuorum!: number
}
