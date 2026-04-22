import { IsString, IsNotEmpty, IsObject, IsArray } from 'class-validator'

export class BlogPostDto {
	@IsString()
	@IsNotEmpty()
	title: string

	@IsString()
	@IsNotEmpty()
	slug: string

	@IsString()
	@IsNotEmpty()
	summary: string

	@IsObject()
	@IsNotEmpty()
	body: any

	@IsArray()
	tagIds: string[]
}
