import assert from "node:assert/strict";
import test from "node:test";
import { gzipSync } from "node:zlib";
import {
  decodeBackup,
  encodeBackup,
  InvalidBackupError,
  isUploadUrl,
  type RecipeBackup,
  validateBackup,
} from "../src/lib/backup-format";

function fixture(): RecipeBackup {
  return {
    format: "recipes-app",
    version: 1,
    exportedAt: "2026-10-07T10:00:00.000Z",
    recipes: [
      {
        id: "recipe-1",
        title: "Баница 🥐",
        description: null,
        ingredients: "Сирене\nЯйца",
        steps: "Изпечете",
        cookMinutes: 30,
        imageUrl: "/uploads/photo.png",
        sourceUrl: "https://example.com/recipe",
        categories: ["Breakfast", "Bread & Pastries"],
        createdAt: "2026-10-01T10:00:00.000Z",
        ownerEmail: "cook@example.com",
      },
    ],
    photos: [
      {
        url: "/uploads/photo.png",
        mimeType: "image/png",
        base64:
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aT1cAAAAASUVORK5CYII=",
      },
    ],
  };
}

test("compressed backup round-trips Bulgarian, multiple categories, creator and exact photo bytes", async () => {
  const backup = fixture();
  assert.deepEqual(await decodeBackup(await encodeBackup(backup)), backup);
});

test("validation rejects future versions, duplicate IDs, missing or duplicate photos, and invalid recipe fields", () => {
  const mutations: ((backup: RecipeBackup) => void)[] = [
    (backup) => {
      (backup as { version: number }).version = 2;
    },
    (backup) => {
      backup.recipes.push({ ...backup.recipes[0] });
    },
    (backup) => {
      backup.photos = [];
    },
    (backup) => {
      backup.photos.push({ ...backup.photos[0] });
    },
    (backup) => {
      backup.recipes[0].createdAt = "not a date";
    },
    (backup) => {
      backup.recipes[0].cookMinutes = 1.5;
    },
    (backup) => {
      backup.recipes[0].title = "  ";
    },
    (backup) => {
      backup.photos[0].base64 = Buffer.from("fake png").toString("base64");
    },
    (backup) => {
      backup.photos[0].mimeType = "image/svg+xml";
    },
    (backup) => {
      backup.recipes[0].imageUrl = "javascript:alert(1)";
    },
  ];
  for (const mutate of mutations) {
    const backup = fixture();
    mutate(backup);
    assert.throws(() => validateBackup(backup), InvalidBackupError);
  }
});

test("uploads cannot reference parent directories, encoded traversal or unrelated files", () => {
  for (const path of [
    "/uploads/../secret.png",
    "/uploads/%2e%2e/secret.png",
    "/etc/passwd",
    "/uploads/a/b.png",
    "/uploads/photo.svg",
  ])
    assert.equal(isUploadUrl(path), false);
  assert.equal(isUploadUrl("/uploads/legacy-photo_123.jpeg"), true);
});

test("remote image references are retained and archives contain no extra account fields", () => {
  const backup = fixture();
  backup.recipes[0].imageUrl = "https://example.com/photo.jpg";
  backup.photos = [];
  const input = { ...backup, accounts: [{ password: "secret" }] };
  assert.deepEqual(validateBackup(input), backup);
});

test("invalid gzip, malformed JSON and unrelated JSON are rejected", async () => {
  for (const bytes of [
    Buffer.from("not gzip"),
    gzipSync("{bad json"),
    gzipSync('{"version":1}'),
  ])
    await assert.rejects(decodeBackup(bytes), InvalidBackupError);
});
