import 'dotenv/config'
import { hash } from 'argon2'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient, RoleName } from '../src/generated/prisma/client'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set')
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl })
const prisma = new PrismaClient({ adapter })

async function main() {
	const adminUsername = process.env.SEED_ADMIN_USERNAME
	const adminPassword = process.env.SEED_ADMIN_PASSWORD
	const adminEmail = process.env.SEED_ADMIN_EMAIL
	const adminName = process.env.SEED_ADMIN_NAME ?? 'Initial Admin'
	const adminPhone = process.env.SEED_ADMIN_PHONE ?? '+40700000000'
	const adminBirthDate = process.env.SEED_ADMIN_BIRTHDATE ?? '1990-01-01'

	if (!adminUsername || !adminPassword || !adminEmail) {
		throw new Error('Missing env vars: SEED_ADMIN_USERNAME, SEED_ADMIN_PASSWORD, SEED_ADMIN_EMAIL')
	}

	const adminRole = await prisma.role.upsert({
		where: { name: RoleName.ADMIN },
		update: {},
		create: { name: RoleName.ADMIN }
	})

	await prisma.role.upsert({
		where: { name: RoleName.USER },
		update: {},
		create: { name: RoleName.USER }
	})

	const profile = await prisma.profile.upsert({
		where: { email: adminEmail },
		update: {
			name: adminName,
			phone: adminPhone,
			birthDate: new Date(adminBirthDate)
		},
		create: {
			name: adminName,
			email: adminEmail,
			phone: adminPhone,
			birthDate: new Date(adminBirthDate)
		}
	})

	let user = await prisma.user.findUnique({
		where: { username: adminUsername }
	})

	if (!user) {
		user = await prisma.user.create({
			data: {
				username: adminUsername,
				passwordHash: await hash(adminPassword),
				profileId: profile.id
			}
		})
	}

	await prisma.userRole.upsert({
		where: {
			userId_roleId: {
				userId: user.id,
				roleId: adminRole.id
			}
		},
		update: {},
		create: {
			userId: user.id,
			roleId: adminRole.id
		}
	})
}

main()
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
