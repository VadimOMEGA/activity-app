import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class FestivalLocationDto {
	@IsString()
	@IsNotEmpty()
	editionId: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(200)
	name: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	address: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(1000)
	description: string

	@IsString()
	@IsNotEmpty()
	coordinatorId: string
}
