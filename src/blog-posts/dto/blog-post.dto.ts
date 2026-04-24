import { IsString, IsNotEmpty, IsArray, MaxLength, IsJSON, ArrayNotEmpty } from 'class-validator'

export class BlogPostDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	title: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(255)
	slug: string

	@IsString()
	@IsNotEmpty()
	@MaxLength(500)
	summary: string

	@IsJSON()
	@IsNotEmpty()
	body: any

	@IsArray()
	@ArrayNotEmpty()
	@IsString({ each: true })
	tagIds: string[]
}
