import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { PrismaService } from 'src/prisma.service'
import { ProfilesModule } from 'src/profiles/profiles.module'
import { MembersModule } from 'src/members/members.module'
import { DojoMentorModule } from 'src/dojo-mentor/dojo-mentor.module'

@Module({
	imports: [ProfilesModule, MembersModule, DojoMentorModule],
	controllers: [UsersController],
	providers: [UsersService, PrismaService],
	exports: [UsersService]
})
export class UsersModule {}
