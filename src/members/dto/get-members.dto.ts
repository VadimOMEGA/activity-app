import { Equals, IsEnum, IsOptional, ValidateIf } from 'class-validator'
import { FullMemberKind, MemberType } from 'src/generated/prisma/enums'

export class GetMembersDto {
	@ValidateIf((o: GetMembersDto) => o.memberType !== undefined || o.fullMemberKind !== undefined)
	@IsEnum(MemberType)
	@ValidateIf((o: GetMembersDto) => o.fullMemberKind !== undefined)
	@Equals(MemberType.FULL, {
		message: 'memberType must be FULL when fullMemberKind is provided'
	})
	memberType?: MemberType

	@IsOptional()
	@ValidateIf((o: GetMembersDto) => o.memberType === MemberType.FULL)
	@IsEnum(FullMemberKind)
	fullMemberKind?: FullMemberKind
}
