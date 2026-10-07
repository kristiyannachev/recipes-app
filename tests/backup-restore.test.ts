import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import { decodeBackup, type RecipeBackup } from "../src/lib/backup-format";
import { exportRecipes, restoreRecipes } from "../src/lib/recipe-backup";

test("restore rolls back all recipe writes and cleans fresh photos if a database write fails", async () => {
  const root = resolve(".");
  const dir = mkdtempSync(join(tmpdir(), "recipes-restore-"));
  const previousUploadDir = process.env.RECIPES_UPLOAD_DIR;
  process.env.RECIPES_UPLOAD_DIR = join(dir, "uploads");
  const db = new PrismaClient({
    datasources: { db: { url: `file:${join(dir, "local.db")}` } },
  });
  try {
    cpSync(join(root, "prisma/schema.prisma"), join(dir, "schema.prisma"));
    cpSync(join(root, "prisma/migrations"), join(dir, "migrations"), {
      recursive: true,
    });
    writeFileSync(join(dir, "local.db"), "");
    execFileSync(
      process.execPath,
      [
        join(root, "node_modules/prisma/build/index.js"),
        "migrate",
        "deploy",
        "--schema",
        join(dir, "schema.prisma"),
      ],
      { stdio: "pipe" },
    );
    const owner = await db.user.create({
      data: { id: "cook", email: "cook@example.com", name: "Cook" },
    });
    await db.recipe.create({
      data: {
        id: "first",
        title: "Original",
        ingredients: "Rice",
        steps: "Cook",
        ownerId: owner.id,
      },
    });
    await db.recipePreference.create({
      data: {
        recipeId: "first",
        userId: owner.id,
        isFavorite: true,
        note: "Private",
      },
    });
    const backup: RecipeBackup = {
      format: "recipes-app",
      version: 1,
      exportedAt: new Date().toISOString(),
      recipes: [
        {
          id: "first",
          title: "Updated",
          ingredients: "Rice",
          steps: "Cook",
          description: null,
          cookMinutes: 10,
          imageUrl: "/uploads/photo.png",
          sourceUrl: null,
          categories: ["Soups"],
          createdAt: new Date().toISOString(),
          ownerEmail: owner.email,
        },
        {
          id: "second",
          title: "New",
          ingredients: "Salt",
          steps: "Mix",
          description: null,
          cookMinutes: null,
          imageUrl: null,
          sourceUrl: null,
          categories: [],
          createdAt: new Date().toISOString(),
          ownerEmail: "unmatched@example.com",
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
    const before = await db.recipe.findMany();
    // First row succeeds; second fails its foreign key after the photo is written.
    await assert.rejects(restoreRecipes(db, backup, "missing-administrator"));
    assert.deepEqual(await db.recipe.findMany(), before);
    assert.deepEqual(readdirSync(process.env.RECIPES_UPLOAD_DIR), []);

    await restoreRecipes(db, backup, owner.id);
    assert.equal(await db.recipe.count(), 2);
    assert.equal(
      (await db.recipe.findUniqueOrThrow({ where: { id: "second" } })).ownerId,
      owner.id,
    );
    const preference = await db.recipePreference.findFirstOrThrow();
    assert.equal(preference.note, "Private");
    assert.equal(preference.isFavorite, true);
    const exported = await decodeBackup(await exportRecipes(db));
    assert.equal(exported.photos[0].base64, backup.photos[0].base64);
    assert.equal(exported.recipes[0].title, "Updated");
  } finally {
    await db.$disconnect();
    if (previousUploadDir === undefined) delete process.env.RECIPES_UPLOAD_DIR;
    else process.env.RECIPES_UPLOAD_DIR = previousUploadDir;
    rmSync(dir, { recursive: true, force: true });
  }
});
