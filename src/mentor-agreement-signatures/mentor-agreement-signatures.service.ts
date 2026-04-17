import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { MentorAgreementSignatureDto } from './dto/mentor-agreement-signature.dto'

@Injectable()
export class MentorAgreementSignaturesService {
	constructor(private readonly prisma: PrismaService) {}

	getAll() {
		return this.prisma.mentorAgreementSignature.findMany({
			include: {
				mentor: true,
				document: true
			},
			orderBy: {
				signedAt: 'desc'
			}
		})
	}

	async getById(id: string) {
		const signature = await this.prisma.mentorAgreementSignature.findUnique({
			where: { id },
			include: {
				mentor: true,
				document: true
			}
		})

		if (!signature) {
			throw new NotFoundException('Mentor agreement signature not found')
		}

		return signature
	}

	async getAllByMentorId(mentorId: string) {
		const mentorExists = await this.prisma.dojoMentor.findUnique({
			where: { id: mentorId },
			select: { id: true }
		})

		if (!mentorExists) {
			throw new NotFoundException('Mentor not found')
		}

		return this.prisma.mentorAgreementSignature.findMany({
			where: { mentorId },
			include: {
				document: true
			},
			orderBy: {
				signedAt: 'desc'
			}
		})
	}

	async create(dto: MentorAgreementSignatureDto) {
		const [mentorExists, documentExists] = await Promise.all([
			this.prisma.dojoMentor.findUnique({
				where: { id: dto.mentorId },
				select: { id: true }
			}),
			this.prisma.agreementDocument.findUnique({
				where: { id: dto.documentId },
				select: { id: true }
			})
		])

		if (!mentorExists) {
			throw new NotFoundException('Mentor not found')
		}

		if (!documentExists) {
			throw new NotFoundException('Agreement document not found')
		}

		const existingSignature = await this.prisma.mentorAgreementSignature.findFirst({
			where: {
				mentorId: dto.mentorId,
				documentId: dto.documentId
			},
			select: { id: true }
		})

		if (existingSignature) {
			throw new BadRequestException('This mentor has already signed this agreement document')
		}

		const createdSignature = await this.prisma.mentorAgreementSignature.create({
			data: {
				mentorId: dto.mentorId,
				documentId: dto.documentId,
				signedAt: new Date()
			}
		})

		return this.getById(createdSignature.id)
	}

	async delete(id: string) {
		const signature = await this.prisma.mentorAgreementSignature.findUnique({
			where: { id },
			select: { id: true }
		})

		if (!signature) {
			throw new NotFoundException('Mentor agreement signature not found')
		}

		await this.prisma.mentorAgreementSignature.delete({
			where: { id: signature.id }
		})

		return {
			message: 'Mentor agreement signature deleted successfully'
		}
	}
}
