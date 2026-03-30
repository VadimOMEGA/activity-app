-- CreateTable
CREATE TABLE "meetup_workshops" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "meetup_id" TEXT NOT NULL,
    "presenter_id" TEXT NOT NULL,
    CONSTRAINT "meetup_workshops_meetup_id_fkey" FOREIGN KEY ("meetup_id") REFERENCES "meetups" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "meetup_workshops_presenter_id_fkey" FOREIGN KEY ("presenter_id") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meetup_anti_workshops" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meetup_id" TEXT NOT NULL,
    "agenda" TEXT NOT NULL,
    CONSTRAINT "meetup_anti_workshops_meetup_id_fkey" FOREIGN KEY ("meetup_id") REFERENCES "meetups" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "meetup_workshops_meetup_id_key" ON "meetup_workshops"("meetup_id");

-- CreateIndex
CREATE UNIQUE INDEX "meetup_anti_workshops_meetup_id_key" ON "meetup_anti_workshops"("meetup_id");
