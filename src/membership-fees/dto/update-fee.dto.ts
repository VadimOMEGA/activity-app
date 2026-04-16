import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator'
import { MembershipFeeStatus } from 'src/generated/prisma/enums'

export class UpdateMembershipFeeDto {
	@IsOptional()
	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0)
	amount!: number

	@IsOptional()
	@IsEnum(MembershipFeeStatus)
	status?: MembershipFeeStatus
}
