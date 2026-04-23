import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Patch,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common'
import { FestivalTicketsService } from './festival-tickets.service'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { FestivalTicketDto } from './dto/festival-ticket.dto'
import { AddRedeemingDto } from './dto/add-redeeming.dto'

@Controller('festival-tickets')
export class FestivalTicketsController {
	constructor(private readonly festivalTicketsService: FestivalTicketsService) {}

	@HttpCode(200)
	@Get('edition/:editionId')
	@Auth('ADMIN')
	getAllByEditionId(editionId: string) {
		return this.festivalTicketsService.getAllByEditionId(editionId)
	}

	@HttpCode(200)
	@Get(':id')
	@Auth('ADMIN')
	getById(id: string) {
		return this.festivalTicketsService.getById(id)
	}

	@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
	@HttpCode(200)
	@Post()
	@Auth('ADMIN')
	create(@Body() dto: FestivalTicketDto) {
		return this.festivalTicketsService.create(dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
	@HttpCode(200)
	@Patch(':id')
	@Auth('ADMIN')
	update(@Body() dto: FestivalTicketDto, id: string) {
		return this.festivalTicketsService.update(id, dto)
	}

	@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
	@HttpCode(200)
	@Post('add-redeeming')
	@Auth('ADMIN')
	addRedeeming(@Body() dto: AddRedeemingDto) {
		return this.festivalTicketsService.addRedeeming(dto)
	}

	@HttpCode(200)
	@Delete(':id')
	@Auth('ADMIN')
	delete(id: string) {
		return this.festivalTicketsService.delete(id)
	}
}
