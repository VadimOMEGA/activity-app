import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import {
	ReorderGalleryPhotosDto,
	UpdateGalleryPhotoCaptionDto
} from './dto/update-gallery-photo.dto'
import { S3Service } from 'src/s3/s3.service'
import { CreateGalleryPhotoUploadIntentDto } from './dto/create-gallery-photo-upload-intent.dto'

@Injectable()
export class FestivalEditionsGalleryPhotosService {
	private readonly allowedUploadExtensions = ['jpg', 'jpeg', 'png', 'webp']

	constructor(
		private readonly prisma: PrismaService,
		private readonly s3Service: S3Service
	) {}

	async getAllByEditionId(editionId: string) {
		const existingEdition = await this.prisma.festivalEdition.findUnique({
			where: {
				id: editionId
			}
		})

		if (!existingEdition) throw new NotFoundException('Festival edition not found')

		return this.prisma.festivalEditionGalleryPhoto.findMany({
			where: {
				editionId
			},
			orderBy: {
				sortOrder: 'asc'
			}
		})
	}

	async reorder(dto: ReorderGalleryPhotosDto) {
		const ids = dto.items.map((i) => i.id)

		const count = await this.prisma.festivalEditionGalleryPhoto.count({
			where: { id: { in: ids } }
		})

		if (count !== ids.length) {
			throw new NotFoundException('One or more photo IDs are invalid')
		}

		return this.prisma.$transaction(
			dto.items.map((item) =>
				this.prisma.festivalEditionGalleryPhoto.update({
					where: { id: item.id },
					data: { sortOrder: item.sortOrder }
				})
			)
		)
	}

	async updateCaption(id: string, dto: UpdateGalleryPhotoCaptionDto) {
		const existing = await this.prisma.festivalEditionGalleryPhoto.findUnique({
			where: { id }
		})

		if (!existing) throw new NotFoundException('Gallery photo not found')

		return this.prisma.festivalEditionGalleryPhoto.update({
			where: { id },
			data: { caption: dto.caption }
		})
	}

	async createWithUploadIntent(editionId: string, dto: CreateGalleryPhotoUploadIntentDto) {
		const existingEdition = await this.prisma.festivalEdition.findUnique({
			where: { id: editionId }
		})

		if (!existingEdition) throw new NotFoundException('Festival edition not found')

		const tempFileName = `gallery-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
		const folder = `festival-editions/${editionId}/gallery`

		const upload = await this.s3Service.createUploadUrl(
			folder,
			tempFileName,
			dto.originalFileName,
			dto.contentType
		)

		const photo = await this.prisma.festivalEditionGalleryPhoto.create({
			data: {
				editionId,
				photoFile: upload.publicUrl,
				caption: dto.caption,
				sortOrder: dto.sortOrder
			}
		})

		return {
			photo,
			upload
		}
	}

	async confirmUploadById(id: string) {
		const photo = await this.prisma.festivalEditionGalleryPhoto.findUnique({
			where: { id },
			select: { id: true, photoFile: true }
		})

		if (!photo) throw new NotFoundException('Gallery photo not found')

		const urlParts = photo.photoFile.split('/')
		const bucketName = this.s3Service.bucketName
		const bucketIndex = urlParts.indexOf(bucketName)

		if (bucketIndex === -1) {
			await this.prisma.festivalEditionGalleryPhoto.delete({ where: { id } })
			throw new BadRequestException('Could not parse S3 key. Record has been cleaned up.')
		}

		const key = urlParts.slice(bucketIndex + 1).join('/')
		const exists = await this.s3Service.objectExists(key)

		if (!exists) {
			await this.prisma.festivalEditionGalleryPhoto.delete({ where: { id } })
			throw new NotFoundException('Uploaded file not found. The record has been deleted.')
		}

		return {
			confirmed: true,
			photoId: photo.id,
			message: 'Upload confirmed successfully.'
		}
	}

	async delete(id: string) {
		const photo = await this.prisma.festivalEditionGalleryPhoto.findUnique({
			where: { id },
			select: { id: true, photoFile: true }
		})

		if (!photo) throw new NotFoundException('Gallery photo not found')

		const urlParts = photo.photoFile.split('/')
		const bucketName = this.s3Service.bucketName
		const bucketIndex = urlParts.indexOf(bucketName)

		if (bucketIndex !== -1) {
			const key = urlParts.slice(bucketIndex + 1).join('/')
			await this.s3Service.deleteObject(key)
		}

		await this.prisma.festivalEditionGalleryPhoto.delete({
			where: { id: photo.id }
		})

		return {
			deleted: true,
			photoId: photo.id,
			message: 'Delete confirmed successfully.'
		}
	}
}
