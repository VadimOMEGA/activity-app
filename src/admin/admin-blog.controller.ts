import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'

import { AdminAuthGuard } from './guards/admin-auth.guard'
import { PrismaService } from 'src/prisma.service'

@Controller('admin/blog')
export class AdminBlogController {
	constructor(private readonly prisma: PrismaService) {}

	@Get('tags')
	@UseGuards(AdminAuthGuard)
	@Render('admin/blog/tags')
	async listTags(@Req() req: Request) {
		const tags = await this.prisma.blogTag.findMany({
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
			},
			orderBy: { createdAt: 'desc' }
		})

		return {
			pageTitle: 'Blog Tags',
			activePage: 'blog-tags',
			isBlogOpen: true,
			currentUser: (req as any).adminUser,
			canEdit: (req as any).canEdit,
			tags
		}
	}

	@Get('posts')
	@UseGuards(AdminAuthGuard)
	@Render('admin/blog/posts')
	async listPosts(@Req() req: Request) {
		const [posts, tags] = await Promise.all([
			this.prisma.blogPost.findMany({
				include: {
					blogPostTags: {
						include: { tag: true }
					}
				},
				orderBy: { createdAt: 'desc' }
			}),
			this.prisma.blogTag.findMany({
				orderBy: { name: 'asc' }
			})
		])

		return {
			pageTitle: 'Blog Posts',
			activePage: 'blog-posts',
			isBlogOpen: true,
			currentUser: (req as any).adminUser,
			canEdit: (req as any).canEdit,
			posts,
			tags,
			tagsJson: JSON.stringify(tags)
		}
	}
}
