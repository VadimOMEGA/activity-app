-- CreateTable
CREATE TABLE "general_assemblies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "announced_at" DATETIME NOT NULL,
    "held_at" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "min_quorum" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "general_assembly_attendees" (
    "assembly_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("assembly_id", "member_id"),
    CONSTRAINT "general_assembly_attendees_assembly_id_fkey" FOREIGN KEY ("assembly_id") REFERENCES "general_assemblies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "general_assembly_attendees_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "general_assembly_attendees_member_id_key" ON "general_assembly_attendees"("member_id");
