import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { TutorAgreementSignatureDto } from './dto/tutor-agreement-signature.dto'

@Injectable()
export class TutorAgreementSignaturesService {
	constructor(private readonly prisma: PrismaService) {}

	getAll() {
		return this.prisma.tutorAgreementSignature.findMany({
			include: {
				tutor: true,
				document: true
			},
			orderBy: {
				signedAt: 'desc'
			}
		})
	}

	async getById(id: string) {
		const signature = await this.prisma.tutorAgreementSignature.findUnique({
			where: { id },
			include: {
				tutor: true,
				document: true
			}
		})

		if (!signature) {
			throw new NotFoundException('Tutor agreement signature not found')
		}

		return signature
	}

	async getAllByTutorId(tutorId: string) {
		const tutorExists = await this.prisma.dojoTutor.findUnique({
			where: { id: tutorId },
			select: { id: true }
		})

		if (!tutorExists) {
			throw new NotFoundException('Tutor not found')
		}

		return this.prisma.tutorAgreementSignature.findMany({
			where: { tutorId },
			include: {
				document: true
			},
			orderBy: {
				signedAt: 'desc'
			}
		})
	}

	async create(dto: TutorAgreementSignatureDto) {
		const [tutorExists, documentExists] = await Promise.all([
			this.prisma.dojoTutor.findUnique({
				where: { id: dto.tutorId },
				select: { id: true }
			}),
			this.prisma.agreementDocument.findUnique({
				where: { id: dto.documentId },
				select: { id: true }
			})
		])

		if (!tutorExists) {
			throw new NotFoundException('Tutor not found')
		}

		if (!documentExists) {
			throw new NotFoundException('Agreement document not found')
		}

		const existingSignature = await this.prisma.tutorAgreementSignature.findFirst({
			where: {
				tutorId: dto.tutorId,
				documentId: dto.documentId
			},
			select: { id: true }
		})

		if (existingSignature) {
			throw new BadRequestException('This tutor has already signed this agreement document')
		}

		const createdSignature = await this.prisma.tutorAgreementSignature.create({
			data: {
				tutorId: dto.tutorId,
				documentId: dto.documentId,
				signedAt: new Date()
			}
		})

		return this.getById(createdSignature.id)
	}

	async delete(id: string) {
		const signature = await this.prisma.tutorAgreementSignature.findUnique({
			where: { id },
			select: { id: true }
		})

		if (!signature) {
			throw new NotFoundException('Tutor agreement signature not found')
		}

		await this.prisma.tutorAgreementSignature.delete({
			where: { id: signature.id }
		})

		return {
			message: 'Tutor agreement signature deleted successfully'
		}
	}
}
