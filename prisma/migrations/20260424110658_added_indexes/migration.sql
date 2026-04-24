-- DropIndex
DROP INDEX "festival_guests_profile_id_key";

-- DropIndex
DROP INDEX "festival_tickets_code_key";

-- DropIndex
DROP INDEX "festival_volunteers_profile_id_key";

-- CreateIndex
CREATE INDEX "festival_programs_location_id_starts_at_ends_at_idx" ON "festival_programs"("location_id", "starts_at", "ends_at");
