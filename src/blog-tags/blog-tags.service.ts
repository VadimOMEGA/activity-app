import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { BlogTagDto } from './dto/blog-tag.dto'
import { UpdateBlogTagDto } from './dto/blog-tag-update.dto'

@Injectable()
export class BlogTagsService {
	constructor(private readonly prisma: PrismaService) {}

	getAll() {
		return this.prisma.blogTag.findMany({
			include: {
				blogPostTags: {
					include: { post: true },
					orderBy: {
						post: {
							publishedAt: { sort: 'desc', nulls: 'first' }
						}
					}
				},
				festivalEditions: {
					orderBy: { year: 'asc' }
				},
				_count: {
					select: { blogPostTags: true, festivalEditions: true }
				}
			}
		})
	}

	async create(dto: BlogTagDto) {
		const existingName = await this.prisma.blogTag.findUnique({
			where: { name: dto.name }
		})

		if (existingName) throw new BadRequestException('Tag with this name already exists')

		return this.prisma.blogTag.create({
			data: {
				name: dto.name
			}
		})
	}

	async update(id: string, dto: UpdateBlogTagDto) {
		const existingTag = await this.prisma.blogTag.findUnique({
			where: { id }
		})

		if (!existingTag) throw new BadRequestException('Tag not found')

		if (!dto || Object.keys(dto).length === 0)
			throw new BadRequestException('No data provided for update')

		if (dto.name) {
			const existingName = await this.prisma.blogTag.findUnique({
				where: { name: dto.name }
			})

			if (existingName && existingName.id !== id) {
				throw new BadRequestException('Tag with this name already exists')
			}
		}

		return this.prisma.blogTag.update({
			where: { id },
			data: {
				name: dto.name
			}
		})
	}

	async delete(id: string) {
		const existingTag = await this.prisma.blogTag.findUnique({
			where: { id }
		})

		if (!existingTag) throw new BadRequestException('Tag not found')

		return this.prisma.blogTag.delete({
			where: { id }
		})
	}
}
