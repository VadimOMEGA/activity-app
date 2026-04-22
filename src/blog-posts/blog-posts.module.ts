import { Module } from '@nestjs/common'
import { BlogPostsService } from './blog-posts.service'
import { BlogPostsController } from './blog-posts.controller'
import { PrismaService } from 'src/prisma.service'
import { BlogTagsModule } from 'src/blog-tags/blog-tags.module'

@Module({
	imports: [BlogTagsModule],
	controllers: [BlogPostsController],
	providers: [BlogPostsService, PrismaService]
})
export class BlogPostsModule {}
