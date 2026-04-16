import { IsDateString, IsEnum, IsOptional, ValidateIf } from 'class-validator'
import { FullMemberKind, MemberType } from 'src/generated/prisma/enums'

export class MemberDto {
	@IsEnum(MemberType)
	memberType!: MemberType

	@ValidateIf((o: MemberDto) => o.memberType === MemberType.FULL)
	@IsEnum(FullMemberKind)
	fullMemberKind?: FullMemberKind

	@IsOptional() // It will default to now()
	@IsDateString()
	joinedAt?: Date
}
