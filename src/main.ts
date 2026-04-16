import cookieParser from 'cookie-parser'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.setGlobalPrefix('api')
	app.useGlobalFilters(new GlobalExceptionFilter())
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	app.use(cookieParser())

	app.enableCors({
		origin: ['http://localhost:3000'],
		credentials: true,
		exposedHeaders: ['set-cookie'],
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
		optionsSuccessStatus: 200
	})

	await app.listen(process.env.PORT ?? 4200)
}

void bootstrap()
