-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_aspiring_members" (
    "member_id" TEXT NOT NULL PRIMARY KEY,
    CONSTRAINT "aspiring_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_aspiring_members" ("member_id") SELECT "member_id" FROM "aspiring_members";
DROP TABLE "aspiring_members";
ALTER TABLE "new_aspiring_members" RENAME TO "aspiring_members";
CREATE TABLE "new_dojo_mentors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "dojo_mentors_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_dojo_mentors" ("created_at", "description", "id", "profile_id", "updated_at") SELECT "created_at", "description", "id", "profile_id", "updated_at" FROM "dojo_mentors";
DROP TABLE "dojo_mentors";
ALTER TABLE "new_dojo_mentors" RENAME TO "dojo_mentors";
CREATE UNIQUE INDEX "dojo_mentors_profile_id_key" ON "dojo_mentors"("profile_id");
CREATE TABLE "new_dojo_ninjas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "tutor_id" TEXT,
    "useful_info" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "dojo_ninjas_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dojo_ninjas_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "dojo_tutors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_dojo_ninjas" ("created_at", "id", "profile_id", "tutor_id", "updated_at", "useful_info") SELECT "created_at", "id", "profile_id", "tutor_id", "updated_at", "useful_info" FROM "dojo_ninjas";
DROP TABLE "dojo_ninjas";
ALTER TABLE "new_dojo_ninjas" RENAME TO "dojo_ninjas";
CREATE UNIQUE INDEX "dojo_ninjas_profile_id_key" ON "dojo_ninjas"("profile_id");
CREATE UNIQUE INDEX "dojo_ninjas_tutor_id_key" ON "dojo_ninjas"("tutor_id");
CREATE TABLE "new_dojo_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "starts_at" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "mentor_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "dojo_sessions_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "dojo_mentors" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_dojo_sessions" ("created_at", "id", "location", "mentor_id", "starts_at", "theme", "updated_at") SELECT "created_at", "id", "location", "mentor_id", "starts_at", "theme", "updated_at" FROM "dojo_sessions";
DROP TABLE "dojo_sessions";
ALTER TABLE "new_dojo_sessions" RENAME TO "dojo_sessions";
CREATE TABLE "new_dojo_tutors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "dojo_tutors_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_dojo_tutors" ("created_at", "id", "profile_id", "updated_at") SELECT "created_at", "id", "profile_id", "updated_at" FROM "dojo_tutors";
DROP TABLE "dojo_tutors";
ALTER TABLE "new_dojo_tutors" RENAME TO "dojo_tutors";
CREATE UNIQUE INDEX "dojo_tutors_profile_id_key" ON "dojo_tutors"("profile_id");
CREATE TABLE "new_full_members" (
    "member_id" TEXT NOT NULL PRIMARY KEY,
    "full_member_kind" TEXT NOT NULL,
    CONSTRAINT "full_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_full_members" ("full_member_kind", "member_id") SELECT "full_member_kind", "member_id" FROM "full_members";
DROP TABLE "full_members";
ALTER TABLE "new_full_members" RENAME TO "full_members";
CREATE TABLE "new_general_assembly_attendees" (
    "assembly_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("assembly_id", "member_id"),
    CONSTRAINT "general_assembly_attendees_assembly_id_fkey" FOREIGN KEY ("assembly_id") REFERENCES "general_assemblies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "general_assembly_attendees_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_general_assembly_attendees" ("assembly_id", "created_at", "member_id", "updated_at") SELECT "assembly_id", "created_at", "member_id", "updated_at" FROM "general_assembly_attendees";
DROP TABLE "general_assembly_attendees";
ALTER TABLE "new_general_assembly_attendees" RENAME TO "general_assembly_attendees";
CREATE UNIQUE INDEX "general_assembly_attendees_member_id_key" ON "general_assembly_attendees"("member_id");
CREATE TABLE "new_meetup_anti_workshops" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetup_id" TEXT NOT NULL,
    "agenda" TEXT NOT NULL,
    CONSTRAINT "meetup_anti_workshops_meetup_id_fkey" FOREIGN KEY ("meetup_id") REFERENCES "meetups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_meetup_anti_workshops" ("agenda", "id", "meetup_id") SELECT "agenda", "id", "meetup_id" FROM "meetup_anti_workshops";
DROP TABLE "meetup_anti_workshops";
ALTER TABLE "new_meetup_anti_workshops" RENAME TO "meetup_anti_workshops";
CREATE UNIQUE INDEX "meetup_anti_workshops_meetup_id_key" ON "meetup_anti_workshops"("meetup_id");
CREATE TABLE "new_meetup_workshops" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "meetup_id" TEXT NOT NULL,
    "presenter_id" TEXT,
    CONSTRAINT "meetup_workshops_meetup_id_fkey" FOREIGN KEY ("meetup_id") REFERENCES "meetups" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meetup_workshops_presenter_id_fkey" FOREIGN KEY ("presenter_id") REFERENCES "profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_meetup_workshops" ("id", "meetup_id", "presenter_id", "theme", "title") SELECT "id", "meetup_id", "presenter_id", "theme", "title" FROM "meetup_workshops";
DROP TABLE "meetup_workshops";
ALTER TABLE "new_meetup_workshops" RENAME TO "meetup_workshops";
CREATE UNIQUE INDEX "meetup_workshops_meetup_id_key" ON "meetup_workshops"("meetup_id");
CREATE TABLE "new_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "joined_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_members" ("created_at", "id", "joined_at", "profile_id", "updated_at") SELECT "created_at", "id", "joined_at", "profile_id", "updated_at" FROM "members";
DROP TABLE "members";
ALTER TABLE "new_members" RENAME TO "members";
CREATE UNIQUE INDEX "members_profile_id_key" ON "members"("profile_id");
CREATE TABLE "new_membership_fees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "member_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "membership_fees_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_membership_fees" ("amount", "created_at", "id", "member_id", "status", "updated_at", "year") SELECT "amount", "created_at", "id", "member_id", "status", "updated_at", "year" FROM "membership_fees";
DROP TABLE "membership_fees";
ALTER TABLE "new_membership_fees" RENAME TO "membership_fees";
CREATE UNIQUE INDEX "membership_fees_member_id_year_key" ON "membership_fees"("member_id", "year");
CREATE TABLE "new_mentor_agreement_signatures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mentor_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "signed_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "mentor_agreement_signatures_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "dojo_mentors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "mentor_agreement_signatures_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "agreement_documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_mentor_agreement_signatures" ("created_at", "document_id", "id", "mentor_id", "signed_at", "updated_at") SELECT "created_at", "document_id", "id", "mentor_id", "signed_at", "updated_at" FROM "mentor_agreement_signatures";
DROP TABLE "mentor_agreement_signatures";
ALTER TABLE "new_mentor_agreement_signatures" RENAME TO "mentor_agreement_signatures";
CREATE UNIQUE INDEX "mentor_agreement_signatures_mentor_id_document_id_key" ON "mentor_agreement_signatures"("mentor_id", "document_id");
CREATE TABLE "new_tutor_agreement_signatures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tutor_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "signed_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tutor_agreement_signatures_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "dojo_tutors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tutor_agreement_signatures_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "agreement_documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tutor_agreement_signatures" ("created_at", "document_id", "id", "signed_at", "tutor_id", "updated_at") SELECT "created_at", "document_id", "id", "signed_at", "tutor_id", "updated_at" FROM "tutor_agreement_signatures";
DROP TABLE "tutor_agreement_signatures";
ALTER TABLE "new_tutor_agreement_signatures" RENAME TO "tutor_agreement_signatures";
CREATE UNIQUE INDEX "tutor_agreement_signatures_tutor_id_document_id_key" ON "tutor_agreement_signatures"("tutor_id", "document_id");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "users_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_users" ("created_at", "id", "password_hash", "profile_id", "updated_at", "username") SELECT "created_at", "id", "password_hash", "profile_id", "updated_at", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_profile_id_key" ON "users"("profile_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
