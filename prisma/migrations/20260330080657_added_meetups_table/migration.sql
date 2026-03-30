-- DropIndex
DROP INDEX "membership_fees_member_id_key";

-- CreateTable
CREATE TABLE "meetups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "starts_at" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
