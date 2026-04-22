import { Module } from '@nestjs/common'
import { BlogTagsService } from './blog-tags.service'
import { BlogTagsController } from './blog-tags.controller'
import { PrismaService } from 'src/prisma.service'

@Module({
	controllers: [BlogTagsController],
	providers: [BlogTagsService, PrismaService],
	exports: [BlogTagsService]
})
export class BlogTagsModule {}
