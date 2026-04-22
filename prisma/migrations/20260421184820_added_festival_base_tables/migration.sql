-- CreateTable
CREATE TABLE "festival_editions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "custom_logo_file" TEXT NOT NULL,
    "hero_image_file" TEXT NOT NULL,
    "short_description" TEXT NOT NULL,
    "long_description" TEXT NOT NULL,
    "secondary_image_file" TEXT NOT NULL,
    "accent_image_file" TEXT NOT NULL,
    "main_color" TEXT NOT NULL,
    "accent_color" TEXT NOT NULL,
    "after_video_file" TEXT NOT NULL,
    "blogTagId" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "festival_editions_blogTagId_fkey" FOREIGN KEY ("blogTagId") REFERENCES "blog_tags" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "festival_editions_gallery_photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "edition_id" TEXT NOT NULL,
    "photo_file" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "festival_editions_gallery_photos_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "festival_editions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_membership_fees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "member_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "amount" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "membership_fees_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    CONSTRAINT "mentor_agreement_signatures_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "agreement_documents" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    CONSTRAINT "tutor_agreement_signatures_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "agreement_documents" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_tutor_agreement_signatures" ("created_at", "document_id", "id", "signed_at", "tutor_id", "updated_at") SELECT "created_at", "document_id", "id", "signed_at", "tutor_id", "updated_at" FROM "tutor_agreement_signatures";
DROP TABLE "tutor_agreement_signatures";
ALTER TABLE "new_tutor_agreement_signatures" RENAME TO "tutor_agreement_signatures";
CREATE UNIQUE INDEX "tutor_agreement_signatures_tutor_id_document_id_key" ON "tutor_agreement_signatures"("tutor_id", "document_id");
CREATE TABLE "new_user_roles" (
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("user_id", "role_id"),
    CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_roles" ("created_at", "role_id", "updated_at", "user_id") SELECT "created_at", "role_id", "updated_at", "user_id" FROM "user_roles";
DROP TABLE "user_roles";
ALTER TABLE "new_user_roles" RENAME TO "user_roles";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "festival_editions_year_key" ON "festival_editions"("year");

-- CreateIndex
CREATE UNIQUE INDEX "festival_editions_gallery_photos_photo_file_key" ON "festival_editions_gallery_photos"("photo_file");
