-- Preserve each existing category as the first entry of a JSON array.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Recipe" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "ingredients" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "cookMinutes" INTEGER,
    "imageUrl" TEXT,
    "sourceUrl" TEXT,
    "categories" JSONB NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Recipe" (
    "id", "title", "description", "ingredients", "steps",
    "cookMinutes", "imageUrl", "sourceUrl", "categories", "createdAt"
)
SELECT
    "id", "title", "description", "ingredients", "steps",
    "cookMinutes", "imageUrl", "sourceUrl",
    CASE
        WHEN "category" IS NULL OR TRIM("category") = '' THEN '[]'
        ELSE json_array("category")
    END,
    "createdAt"
FROM "Recipe";
DROP TABLE "Recipe";
ALTER TABLE "new_Recipe" RENAME TO "Recipe";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
