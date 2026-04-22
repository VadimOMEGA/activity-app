-- CreateTable
CREATE TABLE "festival_sections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "edition_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "festival_sections_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "festival_editions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "festival_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "section_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "activity_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "festival_activities_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "festival_sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
