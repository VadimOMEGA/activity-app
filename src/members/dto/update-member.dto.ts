import { Equals, IsDateString, IsEnum, IsOptional, ValidateIf } from 'class-validator'
import { FullMemberKind, MemberType } from 'src/generated/prisma/enums'

export class UpdateMemberDto {
	@IsOptional()
	@IsDateString()
	joinedAt?: Date

	@ValidateIf((o: UpdateMemberDto) => o.memberType !== undefined || o.fullMemberKind !== undefined)
	@IsEnum(MemberType)
	@ValidateIf((o: UpdateMemberDto) => o.fullMemberKind !== undefined)
	@Equals(MemberType.FULL, {
		message: 'memberType must be FULL when fullMemberKind is provided'
	})
	memberType?: MemberType

	@IsOptional()
	@ValidateIf((o: UpdateMemberDto) => o.memberType === MemberType.FULL)
	@IsEnum(FullMemberKind)
	fullMemberKind?: FullMemberKind
}
