/*
  Warnings:

  - You are about to alter the column `amount` on the `membership_fees` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.

*/
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
    CONSTRAINT "membership_fees_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_membership_fees" ("amount", "created_at", "id", "member_id", "status", "updated_at", "year") SELECT "amount", "created_at", "id", "member_id", "status", "updated_at", "year" FROM "membership_fees";
DROP TABLE "membership_fees";
ALTER TABLE "new_membership_fees" RENAME TO "membership_fees";
CREATE UNIQUE INDEX "membership_fees_member_id_year_key" ON "membership_fees"("member_id", "year");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
