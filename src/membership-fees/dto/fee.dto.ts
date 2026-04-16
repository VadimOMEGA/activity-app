import { IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'
import { MembershipFeeStatus } from 'src/generated/prisma/enums'

export class MembershipFeeDto {
	@IsString()
	memberId!: string

	@IsInt()
	@Min(2000)
	@Max(2100)
	year!: number

	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0)
	amount!: number

	@IsOptional()
	@IsEnum(MembershipFeeStatus)
	status?: MembershipFeeStatus
}
