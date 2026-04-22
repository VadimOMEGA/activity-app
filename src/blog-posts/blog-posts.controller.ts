import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { BlogPostsService } from './blog-posts.service'
import { BlogPostDto } from './dto/blog-post.dto'
import { UpdateBlogPostDto } from './dto/update-blog-post.dto'

@Controller('blog-posts')
export class BlogPostsController {
	constructor(private readonly blogPostsService: BlogPostsService) {}

	@Post()
	create(@Body() blogPostDto: BlogPostDto) {
		return this.blogPostsService.create(blogPostDto)
	}

	@Get()
	getAll() {
		return this.blogPostsService.getAll()
	}

	@Get(':id')
	getById(@Param('id') id: string) {
		return this.blogPostsService.getById(id)
	}

	@Get('slug/:slug')
	getBySlug(@Param('slug') slug: string) {
		return this.blogPostsService.getBySlug(slug)
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateBlogPostDto: UpdateBlogPostDto) {
		return this.blogPostsService.update(id, updateBlogPostDto)
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.blogPostsService.remove(id)
	}
}
