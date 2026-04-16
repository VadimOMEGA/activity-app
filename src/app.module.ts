import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { RolesModule } from './roles/roles.module'
import { ProfilesModule } from './profiles/profiles.module'
import { MembersModule } from './members/members.module';
import { MembershipFeesModule } from './membership-fees/membership-fees.module';
import { GeneralAssembliesModule } from './general-assemblies/general-assemblies.module';

@Module({
	imports: [ConfigModule.forRoot(), AuthModule, UsersModule, RolesModule, ProfilesModule, MembersModule, MembershipFeesModule, GeneralAssembliesModule]
})
export class AppModule {}
