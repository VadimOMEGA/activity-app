import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { BlogPostDto } from './dto/blog-post.dto'
import { UpdateBlogPostDto } from './dto/update-blog-post.dto'

@Injectable()
export class BlogPostsService {
	constructor(private readonly prisma: PrismaService) {}

	async getAll() {
		return this.prisma.blogPost.findMany({
			include: {
				blogPostTags: {
					include: { tag: true }
				}
			},
			orderBy: { createdAt: 'desc' }
		})
	}

	async getById(id: string) {
		const post = await this.prisma.blogPost.findUnique({
			where: { id },
			include: {
				blogPostTags: {
					include: { tag: true }
				}
			}
		})

		if (!post) throw new NotFoundException('Blog post not found')
		return post
	}

	async getBySlug(slug: string) {
		const post = await this.prisma.blogPost.findFirst({
			where: { slug },
			include: {
				blogPostTags: {
					include: { tag: true }
				}
			}
		})

		if (!post) throw new NotFoundException('Blog post not found')
		return post
	}

	async create(dto: BlogPostDto) {
		const { tagIds, ...data } = dto

		const tags = await this.prisma.blogTag.findMany({ where: { id: { in: tagIds } } })
		if (tags.length !== tagIds.length) throw new NotFoundException('One or more tags not found')

		const existingSlug = await this.prisma.blogPost.findFirst({ where: { slug: data.slug } })
		if (existingSlug) throw new BadRequestException('Blog post with this slug already exists')

		return this.prisma.blogPost.create({
			data: {
				...data,
				blogPostTags: {
					create: tagIds.map((tagId) => ({ tagId }))
				}
			},
			include: {
				blogPostTags: {
					include: { tag: true }
				}
			}
		})
	}

	async update(id: string, dto: UpdateBlogPostDto) {
		const { tagIds, ...data } = dto

		await this.getById(id)

		if (tagIds) {
			const tags = await this.prisma.blogTag.findMany({ where: { id: { in: tagIds } } })
			if (tags.length !== tagIds.length) throw new NotFoundException('One or more tags not found')
		}

		if (data.slug) {
			const existingSlug = await this.prisma.blogPost.findFirst({
				where: { slug: data.slug, NOT: { id } }
			})
			if (existingSlug) throw new BadRequestException('Blog post with this slug already exists')
		}

		return this.prisma.blogPost.update({
			where: { id },
			data: {
				...data,
				blogPostTags: tagIds
					? {
							deleteMany: {},
							create: tagIds.map((tagId) => ({ tagId }))
						}
					: undefined
			},
			include: {
				blogPostTags: {
					include: { tag: true }
				}
			}
		})
	}

	async remove(id: string) {
		await this.getById(id)
		return this.prisma.blogPost.delete({ where: { id } })
	}

	async publish(id: string) {
		const post = await this.getById(id)

		if (post.publishedAt) {
			throw new BadRequestException('Blog post is already published')
		}

		return this.prisma.blogPost.update({
			where: { id },
			data: { publishedAt: new Date() }
		})
	}

	async unpublish(id: string) {
		const post = await this.getById(id)

		if (!post.publishedAt) {
			throw new BadRequestException('Blog post is not published')
		}

		return this.prisma.blogPost.update({
			where: { id },
			data: { publishedAt: null }
		})
	}
}
