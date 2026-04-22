import { IsString, IsOptional, IsObject, IsArray } from 'class-validator'

export class UpdateBlogPostDto {
	@IsString()
	@IsOptional()
	title?: string

	@IsString()
	@IsOptional()
	slug?: string

	@IsString()
	@IsOptional()
	summary?: string

	@IsObject()
	@IsOptional()
	body?: any

	@IsArray()
	@IsOptional()
	tagIds?: string[]
}
