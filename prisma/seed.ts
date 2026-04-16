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

	const systemRoles: RoleName[] = [
		RoleName.USER,
		RoleName.ADMIN,
		RoleName.MEMBER,
		RoleName.MENTOR,
		RoleName.TUTOR
	]

	const seededRoles = await Promise.all(
		systemRoles.map((roleName) =>
			prisma.role.upsert({
				where: { name: roleName },
				update: {},
				create: { name: roleName }
			})
		)
	)

	const roleIdByName = new Map(seededRoles.map((role) => [role.name, role.id]))
	const adminRoleId = roleIdByName.get(RoleName.ADMIN)
	const userRoleId = roleIdByName.get(RoleName.USER)

	if (!adminRoleId || !userRoleId) {
		throw new Error('Failed to seed required roles: ADMIN and USER')
	}

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
				roleId: adminRoleId
			}
		},
		update: {},
		create: {
			userId: user.id,
			roleId: adminRoleId
		}
	})

	const allUsers = await prisma.user.findMany({
		select: { id: true }
	})

	for (const existingUser of allUsers) {
		await prisma.userRole.upsert({
			where: {
				userId_roleId: {
					userId: existingUser.id,
					roleId: userRoleId
				}
			},
			update: {},
			create: {
				userId: existingUser.id,
				roleId: userRoleId
			}
		})
	}
}

main()
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
