import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { FestivalTicketsService } from './festival-tickets.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { FestivalTicketDto } from './dto/festival-ticket.dto'
import { AddRedeemingDto } from './dto/add-redeeming.dto'
import { UpdateTicketGuestCountDto } from './dto/update-ticket-guest-count.dto'

@Controller('festival-tickets')
export class FestivalTicketsController {
	constructor(private readonly festivalTicketsService: FestivalTicketsService) {}

	@HttpCode(200)
	@Get('edition/:editionId')
	@Auth('ADMIN')
	getAllByEditionId(@Param('editionId') editionId: string) {
		return this.festivalTicketsService.getAllByEditionId(editionId)
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(@Param('id') id: string) {
		return this.festivalTicketsService.getById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
	@HttpCode(201)
	@Post()
	@Auth('ADMIN')
	create(@Body() dto: FestivalTicketDto) {
		return this.festivalTicketsService.create(dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
	@HttpCode(200)
	@Patch(':id')
	@Auth('ADMIN')
	update(@Body() dto: UpdateTicketGuestCountDto, @Param('id') id: string) {
		return this.festivalTicketsService.update(id, dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
	@HttpCode(201)
	@Post('add-redeeming')
	@Auth('ADMIN')
	addRedeeming(@Body() dto: AddRedeemingDto) {
		return this.festivalTicketsService.addRedeeming(dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	delete(@Param('id') id: string) {
		return this.festivalTicketsService.delete(id)
	}
}
