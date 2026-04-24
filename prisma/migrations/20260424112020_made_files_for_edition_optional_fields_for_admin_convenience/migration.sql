-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_festival_editions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "custom_logo_file" TEXT,
    "hero_image_file" TEXT,
    "short_description" TEXT NOT NULL,
    "long_description" TEXT NOT NULL,
    "secondary_image_file" TEXT,
    "accent_image_file" TEXT,
    "main_color" TEXT NOT NULL,
    "accent_color" TEXT NOT NULL,
    "after_video_file" TEXT,
    "blogTagId" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "festival_editions_blogTagId_fkey" FOREIGN KEY ("blogTagId") REFERENCES "blog_tags" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_festival_editions" ("accent_color", "accent_image_file", "after_video_file", "blogTagId", "created_at", "custom_logo_file", "hero_image_file", "id", "long_description", "main_color", "secondary_image_file", "short_description", "theme", "title", "updated_at", "year") SELECT "accent_color", "accent_image_file", "after_video_file", "blogTagId", "created_at", "custom_logo_file", "hero_image_file", "id", "long_description", "main_color", "secondary_image_file", "short_description", "theme", "title", "updated_at", "year" FROM "festival_editions";
DROP TABLE "festival_editions";
ALTER TABLE "new_festival_editions" RENAME TO "festival_editions";
CREATE UNIQUE INDEX "festival_editions_year_key" ON "festival_editions"("year");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
