-- CreateTable
CREATE TABLE "festival_programs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "edition_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "starts_at" DATETIME NOT NULL,
    "ends_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "festival_programs_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "festival_editions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "festival_programs_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "festival_locations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "festival_programs_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "festival_activities" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "festival_program_presenters" (
    "program_id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("program_id", "guest_id"),
    CONSTRAINT "festival_program_presenters_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "festival_programs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "festival_program_presenters_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "festival_guests" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "festival_sponsors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "edition_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "logo_file" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "festival_sponsors_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "festival_editions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "festival_sponsor_discount_locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sponsor_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "discount_percent" INTEGER NOT NULL DEFAULT 0,
    "redeem_max" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "festival_sponsor_discount_locations_sponsor_id_fkey" FOREIGN KEY ("sponsor_id") REFERENCES "festival_sponsors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "festival_discount_redeemings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticket_id" TEXT NOT NULL,
    "discount_location_id" TEXT NOT NULL,
    "redeemed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "festival_discount_redeemings_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "festival_tickets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "festival_discount_redeemings_discount_location_id_fkey" FOREIGN KEY ("discount_location_id") REFERENCES "festival_sponsor_discount_locations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "festival_tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "edition_id" TEXT NOT NULL,
    "holder_profile_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "guest_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "festival_tickets_edition_id_fkey" FOREIGN KEY ("edition_id") REFERENCES "festival_editions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "festival_tickets_holder_profile_id_fkey" FOREIGN KEY ("holder_profile_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "festival_discount_redeemings_ticket_id_discount_location_id_key" ON "festival_discount_redeemings"("ticket_id", "discount_location_id");

-- CreateIndex
CREATE UNIQUE INDEX "festival_tickets_code_key" ON "festival_tickets"("code");

-- CreateIndex
CREATE UNIQUE INDEX "festival_tickets_edition_id_code_key" ON "festival_tickets"("edition_id", "code");
