import { PartialType } from '@nestjs/mapped-types'
import { BlogPostDto } from './blog-post.dto'

export class UpdateBlogPostDto extends PartialType(BlogPostDto) {}
