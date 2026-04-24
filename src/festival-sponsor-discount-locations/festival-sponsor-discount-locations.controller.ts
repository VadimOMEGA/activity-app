import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { FestivalSponsorDiscountLocationsService } from './festival-sponsor-discount-locations.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { DiscountLocationDto } from './dto/discount-location.dto'
import { UpdateDiscountLocationDto } from './dto/update-discount-location.dto'

@Controller('festival-sponsor-discount-locations')
export class FestivalSponsorDiscountLocationsController {
	constructor(
		private readonly festivalSponsorDiscountLocationsService: FestivalSponsorDiscountLocationsService
	) {}

	@HttpCode(200)
	@Auth('ADMIN')
	@Get('sponsor/:sponsorId')
	getAllBySponsorId(@Param('sponsorId') sponsorId: string) {
		return this.festivalSponsorDiscountLocationsService.getAllBySponsorId(sponsorId)
	}

	@UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
	@HttpCode(201)
	@Auth('ADMIN')
	@Post()
	create(@Body() dto: DiscountLocationDto) {
		return this.festivalSponsorDiscountLocationsService.create(dto)
	}

	@UsePipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }))
	@HttpCode(200)
	@Auth('ADMIN')
	@Put(':id')
	update(@Param('id') id: string, @Body() dto: UpdateDiscountLocationDto) {
		return this.festivalSponsorDiscountLocationsService.update(id, dto)
	}

	@HttpCode(200)
	@Auth('ADMIN')
	@Delete(':id')
	delete(@Param('id') id: string) {
		return this.festivalSponsorDiscountLocationsService.delete(id)
	}
}
