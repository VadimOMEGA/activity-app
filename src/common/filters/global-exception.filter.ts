import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import type { Request, Response } from 'express'
import { Prisma } from 'src/generated/prisma/client'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()

		if (response.headersSent) {
			return
		}

		if (exception instanceof HttpException) {
			const status = exception.getStatus()
			const exceptionResponse = exception.getResponse()

			response.status(status).json({
				statusCode: status,
				message: this.extractHttpExceptionMessage(exceptionResponse),
				path: request.url,
				timestamp: new Date().toISOString()
			})
			return
		}

		if (exception instanceof Prisma.PrismaClientKnownRequestError) {
			if (exception.code === 'P2002') {
				response.status(HttpStatus.CONFLICT).json({
					statusCode: HttpStatus.CONFLICT,
					message: 'Unique constraint violation',
					path: request.url,
					timestamp: new Date().toISOString()
				})
				return
			}

			response.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST,
				message: 'Database request error',
				path: request.url,
				timestamp: new Date().toISOString()
			})
			return
		}

		if (exception instanceof Prisma.PrismaClientValidationError) {
			response.status(HttpStatus.BAD_REQUEST).json({
				statusCode: HttpStatus.BAD_REQUEST,
				message: 'Invalid database input',
				path: request.url,
				timestamp: new Date().toISOString()
			})
			return
		}

		const isError = exception instanceof Error
		const status = isError ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR
		const message = isError ? exception.message : 'Internal server error'

		response.status(status).json({
			statusCode: status,
			message: message,
			path: request.url,
			timestamp: new Date().toISOString()
		})
	}

	private extractHttpExceptionMessage(exceptionResponse: string | object): string | string[] {
		if (typeof exceptionResponse === 'string') {
			return exceptionResponse
		}

		if (
			typeof exceptionResponse === 'object' &&
			exceptionResponse !== null &&
			'message' in exceptionResponse
		) {
			const message = (exceptionResponse as { message?: string | string[] }).message
			if (message) return message
		}

		return 'Unexpected error'
	}
}
