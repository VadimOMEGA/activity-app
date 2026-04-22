-- CreateTable
CREATE TABLE "festival_volunteers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "edition_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "festival_volunteers_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "festival_editions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "festival_volunteers_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "festival_staff_members" (
    "edition_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("edition_id", "member_id"),
    CONSTRAINT "festival_staff_members_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "festival_editions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "festival_staff_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "festival_guests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "edition_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "festival_guests_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "festival_editions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "festival_guests_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "festival_guest_roles" (
    "guest_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    PRIMARY KEY ("guest_id", "role"),
    CONSTRAINT "festival_guest_roles_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "festival_guests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_roles" (
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("user_id", "role_id"),
    CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user_roles" ("created_at", "role_id", "updated_at", "user_id") SELECT "created_at", "role_id", "updated_at", "user_id" FROM "user_roles";
DROP TABLE "user_roles";
ALTER TABLE "new_user_roles" RENAME TO "user_roles";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "festival_volunteers_profile_id_key" ON "festival_volunteers"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "festival_volunteers_edition_id_profile_id_key" ON "festival_volunteers"("edition_id", "profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "festival_guests_profile_id_key" ON "festival_guests"("profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "festival_guests_edition_id_profile_id_key" ON "festival_guests"("edition_id", "profile_id");
