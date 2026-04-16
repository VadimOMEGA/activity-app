import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { PrismaService } from 'src/prisma.service'
import { ProfilesModule } from 'src/profiles/profiles.module'
import { MembersModule } from 'src/members/members.module'
import { DojoMentorsModule } from 'src/dojo-mentors/dojo-mentors.module'

@Module({
	imports: [ProfilesModule, MembersModule, DojoMentorsModule],
	controllers: [UsersController],
	providers: [UsersService, PrismaService],
	exports: [UsersService]
})
export class UsersModule {}
