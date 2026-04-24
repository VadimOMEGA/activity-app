import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	HttpCode,
	UsePipes,
	ValidationPipe,
	Put
} from '@nestjs/common'
import { BlogPostsService } from './blog-posts.service'
import { BlogPostDto } from './dto/blog-post.dto'
import { UpdateBlogPostDto } from './dto/update-blog-post.dto'
import { Auth } from 'src/auth/decorators/auth.decorator'

@Controller('blog-posts')
export class BlogPostsController {
	constructor(private readonly blogPostsService: BlogPostsService) {}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(201)
	@Post()
	@Auth('ADMIN')
	create(@Body() dto: BlogPostDto) {
		return this.blogPostsService.create(dto)
	}

	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll() {
		return this.blogPostsService.getAll()
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(@Param('id') id: string) {
		return this.blogPostsService.getById(id)
	}

	@HttpCode(200)
	@Get('slug/:slug')
	@Auth('ADMIN')
	getBySlug(@Param('slug') slug: string) {
		return this.blogPostsService.getBySlug(slug)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Put(':id')
	@Auth('ADMIN')
	update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
		return this.blogPostsService.update(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	remove(@Param('id') id: string) {
		return this.blogPostsService.remove(id)
	}

	@HttpCode(200)
	@Patch(':id/publish')
	@Auth('ADMIN')
	publish(@Param('id') id: string) {
		return this.blogPostsService.publish(id)
	}

	@HttpCode(200)
	@Patch(':id/unpublish')
	@Auth('ADMIN')
	unpublish(@Param('id') id: string) {
		return this.blogPostsService.unpublish(id)
	}
}
