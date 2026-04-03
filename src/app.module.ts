import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { RolesModule } from './roles/roles.module'
import { ProfilesModule } from './profiles/profiles.module'

@Module({
	imports: [ConfigModule.forRoot(), AuthModule, UsersModule, RolesModule, ProfilesModule]
})
export class AppModule {}
