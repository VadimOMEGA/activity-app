import { IsHexColor, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min } from 'class-validator'

export class FestivalEditionDto {
	@IsInt()
	@Min(2020)
	@Max(2100)
	year!: number

	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	title!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	theme!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	customLogoFile!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	heroImageFile!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(500)
	shortDescription!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(3000)
	longDescription!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	secondaryImageFile!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	accentImageFile!: string

	@IsHexColor()
	mainColor!: string

	@IsHexColor()
	accentColor!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	afterVideoFile!: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	blogTagId!: string
}
