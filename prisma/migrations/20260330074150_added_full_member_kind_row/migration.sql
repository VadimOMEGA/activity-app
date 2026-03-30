/*
  Warnings:

  - Added the required column `full_member_kind` to the `full_members` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_full_members" (
    "member_id" TEXT NOT NULL PRIMARY KEY,
    "full_member_kind" TEXT NOT NULL,
    CONSTRAINT "full_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_full_members" ("member_id") SELECT "member_id" FROM "full_members";
DROP TABLE "full_members";
ALTER TABLE "new_full_members" RENAME TO "full_members";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
