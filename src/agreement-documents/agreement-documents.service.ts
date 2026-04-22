import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { S3Service } from 'src/s3/s3.service'
import { CreateAgreementDocumentUploadIntentDto } from './dto/create-agreement-document-upload-intent.dto'
import { UpdateAgreementDocumentDto } from './dto/update-agreement-document.dto'

@Injectable()
export class AgreementDocumentsService {
	private readonly allowedUploadExtensions = ['pdf', 'doc', 'docx']

	constructor(
		private readonly prisma: PrismaService,
		private readonly s3Service: S3Service
	) {}

	getAll() {
		return this.prisma.agreementDocument.findMany({
			include: {
				mentorAgreementSignatures: true,
				tutorAgreementSignatures: true
			}
		})
	}

	async getById(id: string) {
		const document = await this.prisma.agreementDocument.findUnique({
			where: { id },
			include: {
				mentorAgreementSignatures: true,
				tutorAgreementSignatures: true
			}
		})

		if (!document) throw new NotFoundException('Agreement document not found')

		return document
	}

	async createWithUploadIntent(dto: CreateAgreementDocumentUploadIntentDto) {
		const existing = await this.prisma.agreementDocument.findUnique({
			where: { slug: dto.slug },
			select: { id: true }
		})

		if (existing) {
			throw new BadRequestException('Agreement document with this slug already exists')
		}

		const createdDocument = await this.prisma.agreementDocument.create({
			data: {
				name: dto.name,
				slug: dto.slug
			}
		})

		try {
			const upload = await this.s3Service.createUploadUrl(
				'agreement-documents',
				dto.slug,
				dto.originalFileName,
				dto.contentType
			)

			return {
				document: await this.getById(createdDocument.id),
				upload
			}
		} catch (error) {
			await this.prisma.agreementDocument.deleteMany({
				where: { id: createdDocument.id }
			})
			throw error
		}
	}

	async confirmUploadByDocumentId(id: string) {
		const document = await this.prisma.agreementDocument.findUnique({
			where: { id },
			select: { id: true, slug: true }
		})

		if (!document) throw new NotFoundException('Agreement document not found')
		const key = await this.findUploadedKeyBySlug(document.slug)

		if (!key) {
			await this.prisma.agreementDocument.deleteMany({
				where: { id: document.id }
			})

			throw new NotFoundException(
				'No uploaded file found. The agreement document record has been deleted.'
			)
		}

		return {
			uploaded: true,
			documentId: document.id,
			key,
			message: 'Uploaded file exists and is valid.'
		}
	}

	async getBySlugWithDownloadUrl(slug: string) {
		const document = await this.prisma.agreementDocument.findUnique({
			where: { slug },
			include: {
				mentorAgreementSignatures: true,
				tutorAgreementSignatures: true
			}
		})

		if (!document) throw new NotFoundException('Agreement document not found')

		const key = await this.findUploadedKeyBySlug(document.slug)
		if (!key) {
			throw new NotFoundException('Agreement document file not found')
		}

		const download = await this.s3Service.createDownloadUrl(key)

		return {
			document,
			file: {
				key,
				...download
			}
		}
	}

	async updateName(id: string, dto: UpdateAgreementDocumentDto) {
		const existing = await this.prisma.agreementDocument.findUnique({
			where: { id },
			select: { id: true }
		})

		if (!existing) throw new NotFoundException('Agreement document not found')

		await this.prisma.agreementDocument.update({
			where: { id },
			data: {
				name: dto.name
			}
		})

		return this.getById(id)
	}

	async delete(id: string) {
		const document = await this.prisma.agreementDocument.findUnique({
			where: { id },
			select: { id: true, slug: true }
		})

		if (!document) throw new NotFoundException('Agreement document not found')

		const key = await this.findUploadedKeyBySlug(document.slug)
		if (key) {
			await this.s3Service.deleteObject(key)
		}

		await this.prisma.agreementDocument.delete({
			where: { id: document.id }
		})

		return {
			deleted: true,
			documentId: document.id,
			fileDeleted: Boolean(key),
			message:
				'Agreement document record deleted. ' +
				(key ? 'Associated file also deleted.' : 'No associated file found to delete.')
		}
	}

	private async findUploadedKeyBySlug(slug: string) {
		const keysToCheck = this.allowedUploadExtensions.map(
			(extension) => `agreement-documents/${slug}.${extension}`
		)

		const checks = await Promise.all(keysToCheck.map((key) => this.s3Service.objectExists(key)))
		const existingIndex = checks.findIndex(Boolean)

		if (existingIndex === -1) {
			return null
		}

		return keysToCheck[existingIndex]
	}
}
