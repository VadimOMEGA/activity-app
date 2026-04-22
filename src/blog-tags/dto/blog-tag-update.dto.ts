import { PartialType } from '@nestjs/mapped-types'
import { BlogTagDto } from './blog-tag.dto'

export class UpdateBlogTagDto extends PartialType(BlogTagDto) {}
