import {
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	NotFound,
	PutObjectCommand,
	S3Client
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { lookup as mimeLookup } from 'mime-types'

@Injectable()
export class S3Service {
	private readonly s3: S3Client
	private readonly bucket: string
	private readonly slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
	private readonly allowedMimeTypes = new Set([
		'application/pdf',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'image/jpeg',
		'image/png',
		'image/webp'
	])
	private readonly mimeTypeToExtension = new Map<string, string>([
		['application/pdf', 'pdf'],
		['application/msword', 'doc'],
		['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx'],
		['image/jpeg', 'jpg'],
		['image/png', 'png'],
		['image/webp', 'webp']
	])

	constructor(private readonly config: ConfigService) {
		const region = this.config.get<string>('S3_REGION')
		const endpoint = this.config.get<string>('S3_ENDPOINT')
		const accessKeyId = this.config.get<string>('S3_ACCESS_KEY_ID')
		const secretAccessKey = this.config.get<string>('S3_SECRET_ACCESS_KEY')
		const bucket = this.config.get<string>('S3_BUCKET')

		if (!accessKeyId || !secretAccessKey || !bucket || !region || !endpoint) {
			throw new Error(
				'Missing S3 config: S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET, S3_REGION, S3_ENDPOINT'
			)
		}

		this.bucket = bucket
		this.s3 = new S3Client({
			region,
			endpoint,
			forcePathStyle: true,
			credentials: {
				accessKeyId,
				secretAccessKey
			}
		})
	}

	get client() {
		return this.s3
	}

	get bucketName() {
		return this.bucket
	}

	async createUploadUrl(
		folder: string,
		fileName: string,
		originalFileName: string,
		providedContentType?: string
	) {
		const expiresIn = Number(this.config.get<string>('S3_PRESIGNED_EXPIRES_UPLOAD') ?? '300')

		const detectedContentType = providedContentType ?? mimeLookup(originalFileName) ?? undefined
		if (!detectedContentType || typeof detectedContentType !== 'string') {
			throw new BadRequestException('Could not determine file content type')
		}

		if (!this.allowedMimeTypes.has(detectedContentType)) {
			throw new BadRequestException('Unsupported file type')
		}

		const extension = this.mimeTypeToExtension.get(detectedContentType)
		if (!extension) {
			throw new BadRequestException('Unsupported file extension for content type')
		}

		const key = `${folder}/${fileName}.${extension}`

		const command = new PutObjectCommand({
			Bucket: this.bucket,
			Key: key,
			ContentType: detectedContentType
		})

		const uploadUrl = await getSignedUrl(this.s3, command, { expiresIn })
		const publicUrl = `${this.config.get<string>('S3_ENDPOINT')}/${this.bucket}/${key}`

		return {
			uploadUrl,
			publicUrl,
			key,
			contentType: detectedContentType,
			expiresIn
		}
	}

	async createDownloadUrl(key: string) {
		if (!key || key.trim().length === 0) {
			throw new BadRequestException('File key is required')
		}

		const expiresIn = Number(this.config.get<string>('S3_PRESIGNED_EXPIRES_DOWNLOAD') ?? '300')

		const command = new GetObjectCommand({
			Bucket: this.bucket,
			Key: key
		})

		const downloadUrl = await getSignedUrl(this.s3, command, { expiresIn })

		return {
			downloadUrl,
			expiresIn
		}
	}

	async objectExists(key: string) {
		if (!key || key.trim().length === 0) return false

		try {
			await this.s3.send(
				new HeadObjectCommand({
					Bucket: this.bucket,
					Key: key
				})
			)
			return true
		} catch (error) {
			if (error instanceof NotFound) {
				return false
			}
			throw error
		}
	}

	async deleteObject(key: string) {
		if (!key || key.trim().length === 0) {
			throw new BadRequestException('File key is required')
		}

		await this.s3.send(
			new DeleteObjectCommand({
				Bucket: this.bucket,
				Key: key
			})
		)

		return {
			deleted: true,
			key
		}
	}

	// Helpers
	extractKeyFromUrl(url: string): string | null {
		const urlParts = url.split('/')
		const bucketName = this.bucketName
		const bucketIndex = urlParts.indexOf(bucketName)

		if (bucketIndex === -1) return null

		return urlParts.slice(bucketIndex + 1).join('/')
	}

	async tryDeleteOldFile(url: string) {
		try {
			const key = this.extractKeyFromUrl(url)
			if (key) {
				await this.deleteObject(key)
			}
		} catch (error) {
			console.error(`Failed to delete old file from S3: ${url}`, error)
		}
	}
}
