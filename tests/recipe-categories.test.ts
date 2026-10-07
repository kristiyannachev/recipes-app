import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import {
  getRecipeCategories,
  parseRecipeCategories,
} from "../src/constants/categories";

test("repeated category form fields keep multiple selections and remove duplicates", () => {
  const formData = new FormData();
  formData.append("categories", "Chicken");
  formData.append("categories", "Soups");
  formData.append("categories", "Chicken");
  assert.deepEqual(parseRecipeCategories(formData.getAll("categories")), [
    "Chicken",
    "Soups",
  ]);
  assert.deepEqual(
    parseRecipeCategories(new FormData().getAll("categories")),
    [],
  );
});

test("invalid category payloads are rejected rather than stored", () => {
  for (const value of [
    "Chicken",
    null,
    {},
    ["Unknown"],
    ["Пилешко"],
    ["Chicken", 42],
  ]) {
    assert.throws(
      () => parseRecipeCategories(value),
      /supported category names/,
    );
  }
});

test("migration preserves recipes and category membership through create and edit", async () => {
  const projectDir = resolve(".");
  const tempDir = mkdtempSync(join(tmpdir(), "recipe-categories-"));
  const schemaPath = join(tempDir, "schema.prisma");
  const migrationName = "20261006120000_multiple_recipe_categories";
  const prismaCli = join(projectDir, "node_modules/prisma/build/index.js");
  const migrate = () =>
    execFileSync(
      process.execPath,
      [prismaCli, "migrate", "deploy", "--schema", schemaPath],
      { stdio: "pipe", encoding: "utf8" },
    );
  const prisma = new PrismaClient({
    datasources: { db: { url: `file:${join(tempDir, "local.db")}` } },
  });

  try {
    // Start with the historical schema and apply the same migration a local install uses.
    const schema = readFileSync(
      join(projectDir, "prisma/schema.prisma"),
      "utf8",
    );
    writeFileSync(join(tempDir, "local.db"), "");
    writeFileSync(
      schemaPath,
      schema.replace(
        /categories\s+Json\s+@default\("\[\]"\)/,
        "category String?",
      ),
    );
    mkdirSync(join(tempDir, "migrations"));
    for (const entry of readdirSync(join(projectDir, "prisma/migrations"))) {
      if (entry < migrationName || entry === "migration_lock.toml")
        cpSync(
          join(projectDir, "prisma/migrations", entry),
          join(tempDir, "migrations", entry),
          { recursive: true },
        );
    }
    migrate();

    const legacyCategories = [
      null,
      "",
      "   ",
      "Chicken",
      "Fish & Seafood",
      'Custom "category"',
    ];
    for (const [index, category] of legacyCategories.entries()) {
      await prisma.$executeRawUnsafe(
        'INSERT INTO "Recipe" ("id", "title", "description", "ingredients", "steps", "cookMinutes", "imageUrl", "sourceUrl", "category", "createdAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        `legacy-${index}`,
        `Recipe ${index}`,
        "Description",
        "One\nTwo",
        "First\nSecond",
        30,
        "/uploads/image.png",
        "https://example.com/recipe",
        category,
        new Date("2026-01-01T12:00:00Z"),
      );
    }
    const recipeFields =
      'SELECT "id", "title", "description", "ingredients", "steps", "cookMinutes", "imageUrl", "sourceUrl", "createdAt" FROM "Recipe" ORDER BY "id"';
    const before = await prisma.$queryRawUnsafe(recipeFields);

    for (const entry of readdirSync(join(projectDir, "prisma/migrations"))) {
      if (entry >= migrationName && entry !== "migration_lock.toml")
        cpSync(
          join(projectDir, "prisma/migrations", entry),
          join(tempDir, "migrations", entry),
          { recursive: true },
        );
    }
    writeFileSync(schemaPath, schema);
    migrate();
    assert.deepEqual(await prisma.$queryRawUnsafe(recipeFields), before);

    const recipes = await prisma.recipe.findMany({ orderBy: { id: "asc" } });
    assert.equal(recipes.length, legacyCategories.length);
    for (const [index, recipe] of recipes.entries()) {
      assert.equal(recipe.ownerId, null);
      const oldCategory = legacyCategories[index];
      assert.deepEqual(
        recipe.categories,
        oldCategory?.trim() ? [oldCategory] : [],
      );
    }

    const created = await prisma.recipe.create({
      data: {
        title: "Chicken soup",
        ingredients: "Chicken",
        steps: "Cook",
        categories: parseRecipeCategories(["Chicken", "Soups"]),
      },
    });
    const saved = await prisma.recipe.findUniqueOrThrow({
      where: { id: created.id },
    });
    assert.deepEqual(saved.categories, ["Chicken", "Soups"]);
    for (const category of ["Chicken", "Soups"])
      assert.ok(getRecipeCategories(saved.categories).includes(category));

    await prisma.recipe.update({
      where: { id: created.id },
      data: { categories: parseRecipeCategories(["Soups", "Side Dishes"]) },
    });
    assert.deepEqual(
      (await prisma.recipe.findUniqueOrThrow({ where: { id: created.id } }))
        .categories,
      ["Soups", "Side Dishes"],
    );
    await prisma.recipe.update({
      where: { id: created.id },
      data: { categories: parseRecipeCategories([]) },
    });
    assert.deepEqual(
      (await prisma.recipe.findUniqueOrThrow({ where: { id: created.id } }))
        .categories,
      [],
    );
    const uncategorized = await prisma.recipe.create({
      data: { title: "No categories", ingredients: "One", steps: "Cook" },
    });
    assert.deepEqual(uncategorized.categories, []);

    execFileSync(
      process.execPath,
      [
        prismaCli,
        "migrate",
        "diff",
        "--from-url",
        `file:${join(tempDir, "local.db")}`,
        "--to-schema-datamodel",
        schemaPath,
        "--exit-code",
      ],
      { stdio: "pipe" },
    );
  } finally {
    await prisma.$disconnect();
    rmSync(tempDir, { recursive: true, force: true });
  }
});
