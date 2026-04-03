-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user_roles" (
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,

    PRIMARY KEY ("user_id", "role_id"),
    CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_user_roles" ("created_at", "role_id", "updated_at", "user_id") SELECT "created_at", "role_id", "updated_at", "user_id" FROM "user_roles";
DROP TABLE "user_roles";
ALTER TABLE "new_user_roles" RENAME TO "user_roles";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
