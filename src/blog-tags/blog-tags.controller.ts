import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { BlogTagsService } from './blog-tags.service'
import { BlogTagDto } from './dto/blog-tag.dto'
import { UpdateBlogTagDto } from './dto/blog-tag-update.dto'

@Controller('blog-tags')
export class BlogTagsController {
	constructor(private readonly blogTagsService: BlogTagsService) {}

	@HttpCode(200)
	@Get()
	@Auth('ADMIN')
	getAll() {
		return this.blogTagsService.getAll()
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Post()
	@Auth('ADMIN')
	create(@Body() dto: BlogTagDto) {
		return this.blogTagsService.create(dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, forbidNonWhitelisted: true, whitelist: true }))
	@HttpCode(200)
	@Put(':id')
	@Auth('ADMIN')
	update(@Param('id') id: string, @Body() dto: UpdateBlogTagDto) {
		return this.blogTagsService.update(id, dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	delete(@Param('id') id: string) {
		return this.blogTagsService.delete(id)
	}
}
