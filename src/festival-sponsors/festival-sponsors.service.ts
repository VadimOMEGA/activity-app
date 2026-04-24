import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { FestivalSponsorDto } from './dto/festival-sponsor.dto'
import { S3Service } from 'src/s3/s3.service'
import { FestivalSponsorUploadIntentDto } from './dto/festival-sponsor-upload-intent.dto'
import { UpdateFestivalSponsorDto } from './dto/update-festival-sponsor.dto'

@Injectable()
export class FestivalSponsorsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly s3Service: S3Service
	) {}

	async getAllByEditionId(editionId: string) {
		const edition = await this.prisma.festivalEdition.findUnique({ where: { id: editionId } })
		if (!edition) {
			throw new NotFoundException('Edition not found')
		}

		return this.prisma.festivalSponsor.findMany({
			where: { editionId },
			include: { festivalSponsorDiscountLocations: true }
		})
	}

	async getById(id: string) {
		const sponsor = await this.prisma.festivalSponsor.findUnique({
			where: { id },
			include: { festivalSponsorDiscountLocations: true }
		})
		if (!sponsor) {
			throw new NotFoundException('Sponsor not found')
		}
		return sponsor
	}

	async createUploadIntent(editionId: string, dto: FestivalSponsorUploadIntentDto) {
		const edition = await this.prisma.festivalEdition.findUnique({ where: { id: editionId } })
		if (!edition) {
			throw new NotFoundException('Edition not found')
		}

		const folder = `festival-editions/${edition.year}/sponsors`

		const tempId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
		const sanitizedName = dto.name
			.toLowerCase()
			.trim()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '')
		const fileName = `${sanitizedName}-${tempId}`
		const intent = await this.s3Service.createUploadUrl(
			folder,
			fileName,
			dto.originalFileName,
			dto.contentType
		)

		return intent
	}

	async create(dto: FestivalSponsorDto) {
		const edition = await this.prisma.festivalEdition.findUnique({ where: { id: dto.editionId } })
		if (!edition) {
			throw new NotFoundException('Edition not found')
		}

		const key = this.s3Service.extractKeyFromUrl(dto.logoFile)
		if (!key) {
			throw new NotFoundException('Invalid logo file URL')
		}

		const fileExists = await this.s3Service.objectExists(key)
		if (!fileExists) {
			throw new NotFoundException('Logo file does not exist in S3')
		}

		return this.prisma.festivalSponsor.create({
			data: dto
		})
	}

	async update(id: string, dto: UpdateFestivalSponsorDto) {
		const existingSponsor = await this.prisma.festivalSponsor.findUnique({ where: { id } })
		if (!existingSponsor) {
			throw new NotFoundException('Sponsor not found')
		}

		if (dto.logoFile && dto.logoFile !== existingSponsor.logoFile) {
			const key = this.s3Service.extractKeyFromUrl(dto.logoFile)
			if (!key) {
				throw new NotFoundException('Invalid logo file URL')
			}

			const fileExists = await this.s3Service.objectExists(key)
			if (!fileExists) {
				throw new NotFoundException('Logo file does not exist in S3')
			}

			await this.s3Service.tryDeleteOldFile(existingSponsor.logoFile)
		}

		return this.prisma.festivalSponsor.update({
			where: { id },
			data: dto
		})
	}

	async delete(id: string) {
		const existingSponsor = await this.prisma.festivalSponsor.findUnique({ where: { id } })
		if (!existingSponsor) {
			throw new NotFoundException('Sponsor not found')
		}

		await this.s3Service.tryDeleteOldFile(existingSponsor.logoFile)

		return this.prisma.festivalSponsor.delete({ where: { id } })
	}
}
