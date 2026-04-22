-- CreateTable
CREATE TABLE "festival_locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "edition_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coordinator_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "festival_locations_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "festival_editions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "festival_locations_coordinator_id_fkey" FOREIGN KEY ("coordinator_id") REFERENCES "festival_volunteers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
