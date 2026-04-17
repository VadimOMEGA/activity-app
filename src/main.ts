import cookieParser from 'cookie-parser'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import hbs from 'hbs'

import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule)

	// Handlebars setup
	app.setBaseViewsDir(join(__dirname, '..', 'views'))
	app.setViewEngine('hbs')

	// Register partials directory
	hbs.registerPartials(join(__dirname, '..', 'views', 'partials'))

	// Register Handlebars helpers
	hbs.registerHelper('eq', (a: unknown, b: unknown) => a === b)
	hbs.registerHelper('toLowerCase', (str: unknown) =>
		typeof str === 'string' ? str.toLowerCase() : str
	)
	hbs.registerHelper('json', (context: unknown) => JSON.stringify(context))
	hbs.registerHelper('formatDate', (dateStr: unknown) => {
		if (!dateStr) return '—'
		const d = new Date(dateStr as string)
		return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
	})

	// Static assets
	app.useStaticAssets(join(__dirname, '..', 'public'))

	// Global prefix only for API routes — admin routes use explicit /admin prefix
	app.setGlobalPrefix('api', {
		exclude: ['admin', 'admin/(.*)', 'css/(.*)', 'js/(.*)']
	})

	app.useGlobalFilters(new GlobalExceptionFilter())
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
