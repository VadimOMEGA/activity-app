/*
  Warnings:

  - Made the column `tutor_id` on table `dojo_ninjas` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_dojo_ninjas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "useful_info" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "dojo_ninjas_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dojo_ninjas_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "dojo_tutors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_dojo_ninjas" ("created_at", "id", "profile_id", "tutor_id", "updated_at", "useful_info") SELECT "created_at", "id", "profile_id", "tutor_id", "updated_at", "useful_info" FROM "dojo_ninjas";
DROP TABLE "dojo_ninjas";
ALTER TABLE "new_dojo_ninjas" RENAME TO "dojo_ninjas";
CREATE UNIQUE INDEX "dojo_ninjas_profile_id_key" ON "dojo_ninjas"("profile_id");
CREATE UNIQUE INDEX "dojo_ninjas_tutor_id_key" ON "dojo_ninjas"("tutor_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
