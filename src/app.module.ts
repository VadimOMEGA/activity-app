import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { RolesModule } from './roles/roles.module'
import { ProfilesModule } from './profiles/profiles.module'
import { MembersModule } from './members/members.module'
import { MembershipFeesModule } from './membership-fees/membership-fees.module'
import { GeneralAssembliesModule } from './general-assemblies/general-assemblies.module'
import { MeetupsModule } from './meetups/meetups.module'
import { DojoMentorsModule } from './dojo-mentors/dojo-mentors.module'
import { DojoTutorsModule } from './dojo-tutors/dojo-tutors.module'
import { DojoNinjasModule } from './dojo-ninjas/dojo-ninjas.module'
import { DojoSessionsModule } from './dojo-sessions/dojo-sessions.module'
import { S3Module } from './s3/s3.module';
import { AgreementDocumentsModule } from './agreement-documents/agreement-documents.module';
import { MentorAgreementSignaturesModule } from './mentor-agreement-signatures/mentor-agreement-signatures.module';
import { TutorAgreementSignaturesModule } from './tutor-agreement-signatures/tutor-agreement-signatures.module';
import { AdminModule } from './admin/admin.module';
import { BlogTagsModule } from './blog-tags/blog-tags.module';
import { BlogPostsModule } from './blog-posts/blog-posts.module';
import { FestivalEditionsModule } from './festival-editions/festival-editions.module';
import { FestivalEditionsGalleryPhotosModule } from './festival-editions-gallery-photos/festival-editions-gallery-photos.module';
import { FestivalSectionsModule } from './festival-sections/festival-sections.module';
import { FestivalActivitiesModule } from './festival-activities/festival-activities.module';
import { FestivalVolunteersModule } from './festival-volunteers/festival-volunteers.module';
import { FesivalLocationsModule } from './fesival-locations/fesival-locations.module';
import { FestivalStaffMembersModule } from './festival-staff-members/festival-staff-members.module';

@Module({
	imports: [
		ConfigModule.forRoot(),
		AuthModule,
		UsersModule,
		RolesModule,
		ProfilesModule,
		MembersModule,
		MembershipFeesModule,
		GeneralAssembliesModule,
		MeetupsModule,
		DojoMentorsModule,
		DojoTutorsModule,
		DojoNinjasModule,
		DojoSessionsModule,
		S3Module,
		AgreementDocumentsModule,
		MentorAgreementSignaturesModule,
		TutorAgreementSignaturesModule,
		AdminModule,
		BlogTagsModule,
		BlogPostsModule,
		FestivalEditionsModule,
		FestivalEditionsGalleryPhotosModule,
		FestivalSectionsModule,
		FestivalActivitiesModule,
		FestivalVolunteersModule,
		FesivalLocationsModule,
		FestivalStaffMembersModule
	]
})
export class AppModule {}
