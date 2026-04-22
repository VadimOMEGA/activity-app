import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { FestivalEditionDto } from './dto/festival-edition.dto'
import { UpdateFestivalEditionDto } from './dto/update-festival-edition.dto'
import { S3Service } from 'src/s3/s3.service'
import { FestivalEditionUploadIntentDto } from './dto/festival-edition-upload-intent.dto'

@Injectable()
export class FestivalEditionsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly s3Service: S3Service
	) {}

	getAll() {
		return this.prisma.festivalEdition.findMany()
	}

	async getById(id: string) {
		const festivalEdition = await this.prisma.festivalEdition.findUnique({
			where: { id },
			include: {
				blogTag: true
			}
		})

		if (!festivalEdition) throw new NotFoundException('Festival edition not found')

		return festivalEdition
	}

	async getByIdFull(id: string) {
		const festivalEdition = await this.prisma.festivalEdition.findUnique({
			where: { id },
			include: {
				festivalEditionGalleryPhotos: {
					orderBy: { sortOrder: 'asc' }
				},
				festivalSections: true,
				festivalPrograms: true,
				festivalVolunteers: true,
				festivalStaffMembers: true,
				festivalTickets: true,
				festivalSponsors: true,
				festivalGuests: true,
				festivalLocations: true,
				blogTag: true
			}
		})

		if (!festivalEdition) throw new NotFoundException('Festival edition not found')

		return festivalEdition
	}

	async createUploadIntents(dto: FestivalEditionUploadIntentDto) {
		const folder = `festival-editions/${dto.year}/assets`
		const intents = await Promise.all(
			dto.files.map(async (file) => {
				const tempId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
				const fileName = `${file.role}-${tempId}`
				const intent = await this.s3Service.createUploadUrl(
					folder,
					fileName,
					file.originalFileName,
					file.contentType
				)
				return {
					role: file.role,
					...intent
				}
			})
		)

		return intents
	}

	async create(dto: FestivalEditionDto) {
		const existingYear = await this.prisma.festivalEdition.findUnique({
			where: { year: dto.year }
		})

		if (existingYear)
			throw new BadRequestException('Festival edition with this year already exists')

		await this.validateFilesExist(dto)

		return this.prisma.festivalEdition.create({ data: dto })
	}

	async update(id: string, dto: UpdateFestivalEditionDto) {
		const existingEdition = await this.prisma.festivalEdition.findUnique({
			where: { id }
		})

		if (!existingEdition) throw new NotFoundException('Festival edition not found')

		if (dto.year) {
			const existingYear = await this.prisma.festivalEdition.findFirst({
				where: {
					year: dto.year,
					NOT: { id }
				}
			})

			if (existingYear)
				throw new BadRequestException('Festival edition with this year already exists')
		}

		await this.validateFilesExist(dto)

		const fileFields: (keyof Omit<FestivalEditionDto, 'year'>)[] = [
			'customLogoFile',
			'heroImageFile',
			'secondaryImageFile',
			'accentImageFile',
			'afterVideoFile'
		]

		for (const field of fileFields) {
			const newValue = dto[field]
			const oldValue = existingEdition[field]

			if (newValue && oldValue && newValue !== oldValue) {
				await this.tryDeleteOldFile(oldValue)
			}
		}

		return this.prisma.festivalEdition.update({
			where: { id },
			data: dto
		})
	}

	async delete(id: string) {
		const existingEdition = await this.prisma.festivalEdition.findUnique({
			where: { id }
		})

		if (!existingEdition) throw new NotFoundException('Festival edition not found')

		const fileFields: (keyof Omit<FestivalEditionDto, 'year'>)[] = [
			'customLogoFile',
			'heroImageFile',
			'secondaryImageFile',
			'accentImageFile',
			'afterVideoFile'
		]

		for (const field of fileFields) {
			const url = existingEdition[field]
			if (url) {
				await this.tryDeleteOldFile(url)
			}
		}

		return this.prisma.festivalEdition.delete({ where: { id } })
	}

	private async validateFilesExist(dto: Partial<FestivalEditionDto>) {
		const fileFields: (keyof Omit<FestivalEditionDto, 'year'>)[] = [
			'customLogoFile',
			'heroImageFile',
			'secondaryImageFile',
			'accentImageFile',
			'afterVideoFile'
		]

		for (const field of fileFields) {
			const url = dto[field]
			if (url) {
				const key = this.extractKeyFromUrl(url)
				if (key) {
					const exists = await this.s3Service.objectExists(key)
					if (!exists) {
						throw new BadRequestException(
							`File for ${field} was not found in storage. Please upload it first.`
						)
					}
				}
			}
		}
	}

	private extractKeyFromUrl(url: string): string | null {
		const urlParts = url.split('/')
		const bucketName = this.s3Service.bucketName
		const bucketIndex = urlParts.indexOf(bucketName)

		if (bucketIndex === -1) return null

		return urlParts.slice(bucketIndex + 1).join('/')
	}

	private async tryDeleteOldFile(url: string) {
		try {
			const key = this.extractKeyFromUrl(url)
			if (key) {
				await this.s3Service.deleteObject(key)
			}
		} catch (error) {
			console.error(`Failed to delete old file from S3: ${url}`, error)
		}
	}
}
