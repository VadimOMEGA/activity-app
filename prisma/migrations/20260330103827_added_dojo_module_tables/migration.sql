-- CreateTable
CREATE TABLE "dojo_mentors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "dojo_mentors_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dojo_tutors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "dojo_tutors_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dojo_ninjas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "useful_info" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "dojo_ninjas_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "dojo_ninjas_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "dojo_tutors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dojo_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "starts_at" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "dojo_sessions_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "dojo_mentors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agreement_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "mentor_agreement_signatures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mentor_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "signed_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "mentor_agreement_signatures_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "dojo_mentors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mentor_agreement_signatures_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "agreement_documents" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tutor_agreement_signatures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tutor_id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "signed_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "tutor_agreement_signatures_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "dojo_tutors" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "tutor_agreement_signatures_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "agreement_documents" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "dojo_mentors_profile_id_key" ON "dojo_mentors"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "dojo_tutors_profile_id_key" ON "dojo_tutors"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "dojo_ninjas_profile_id_key" ON "dojo_ninjas"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "dojo_ninjas_tutor_id_key" ON "dojo_ninjas"("tutor_id");

-- CreateIndex
CREATE UNIQUE INDEX "agreement_documents_slug_key" ON "agreement_documents"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "mentor_agreement_signatures_mentor_id_document_id_key" ON "mentor_agreement_signatures"("mentor_id", "document_id");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_agreement_signatures_tutor_id_document_id_key" ON "tutor_agreement_signatures"("tutor_id", "document_id");
