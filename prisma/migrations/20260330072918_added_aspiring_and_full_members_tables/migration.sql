-- CreateTable
CREATE TABLE "aspiring_members" (
    "member_id" TEXT NOT NULL PRIMARY KEY,
    CONSTRAINT "aspiring_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "full_members" (
    "member_id" TEXT NOT NULL PRIMARY KEY,
    CONSTRAINT "full_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
