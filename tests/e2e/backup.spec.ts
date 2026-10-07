import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { gunzipSync, gzipSync } from "node:zlib";
import type { RecipeBackup } from "../../src/lib/backup-format";
import { expect, test } from "./fixtures";

const photo = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aT1cAAAAASUVORK5CYII=",
  "base64",
);
const part = (backup: RecipeBackup) => ({
  name: "recipes.json.gz",
  mimeType: "application/gzip",
  buffer: gzipSync(JSON.stringify(backup)),
});

test("admin downloads photos and restores added and matching recipes without deleting others or duplicating IDs", async ({
  page,
  request,
  makeRecipe,
}) => {
  const uploaded = await request.post("/api/upload", {
    multipart: {
      file: { name: "photo.png", mimeType: "image/png", buffer: photo },
    },
  });
  expect(uploaded.ok()).toBeTruthy();
  const imageUrl = (await uploaded.json()).url;
  const recipeResponse = await request.post("/api/recipes", {
    data: {
      title: "Баница за резервно копие",
      ingredients: "Сирене\nЯйца",
      steps: "Изпечете",
      categories: ["Breakfast", "Bread & Pastries"],
      imageUrl,
    },
  });
  expect(recipeResponse.status()).toBe(201);
  const recipe = await recipeResponse.json();
  const unrelated = await makeRecipe({ title: "Keep this recipe" });
  const preference = await request.put(`/api/recipes/${recipe.id}/preference`, {
    data: { isFavorite: true, note: "Keep my note" },
  });
  expect(preference.ok()).toBeTruthy();
  await page.goto("/profile");
  const downloading = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download backup", exact: true })
    .click();
  const download = await downloading;
  expect(download.suggestedFilename()).toMatch(/^recipes-backup-.+\.json\.gz$/);
  const path = await download.path();
  if (!path) throw new Error("Missing download");
  const archive: RecipeBackup = JSON.parse(
    gunzipSync(await readFile(path)).toString(),
  );
  const savedRecipe = archive.recipes.find((entry) => entry.id === recipe.id);
  if (!savedRecipe) throw new Error("Recipe missing in export");
  const savedPhoto = archive.photos.find((entry) => entry.url === imageUrl);
  expect(savedPhoto?.base64).toBe(photo.toString("base64"));
  expect(savedRecipe.title).toBe(recipe.title);
  expect(savedRecipe.categories).toEqual(["Breakfast", "Bread & Pastries"]);
  expect(savedRecipe.ownerEmail).toBeTruthy();
  expect(archive).not.toHaveProperty("accounts");
  expect(archive).not.toHaveProperty("preferences");

  const newcomer = {
    ...savedRecipe,
    id: `restored-${randomUUID()}`,
    title: "Restored new recipe",
    ownerEmail: "missing@example.test",
  };
  const backup: RecipeBackup = {
    ...archive,
    recipes: [{ ...savedRecipe, title: "Restored updated recipe" }, newcomer],
    photos: savedPhoto ? [savedPhoto] : [],
  };
  await page.locator("#backup-file").setInputFiles(part(backup));
  await page
    .getByRole("button", { name: "Preview restore", exact: true })
    .click();
  await expect(page.getByText("New recipes: 1", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Recipes to update: 1", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Recipes assigned to your account: 1", { exact: true }),
  ).toBeVisible();
  const before = await (await request.get("/api/recipes")).json();
  expect(
    before.find((entry: { id: string }) => entry.id === recipe.id).title,
  ).toBe(recipe.title);
  await page
    .getByRole("button", { name: "Restore backup", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Cancel", exact: true })
    .click();
  expect((await (await request.get("/api/recipes")).json()).length).toBe(
    before.length,
  );
  await page
    .getByRole("button", { name: "Restore backup", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Restore backup", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "Backup restored successfully.",
  );
  const after = await (await request.get("/api/recipes")).json();
  expect(after.length).toBe(before.length + 1);
  const restored = after.find(
    (entry: { id: string }) => entry.id === recipe.id,
  );
  expect(restored).toMatchObject({
    title: "Restored updated recipe",
    ownerId: recipe.ownerId,
    categories: recipe.categories,
    createdAt: recipe.createdAt,
  });
  expect(
    after.find((entry: { id: string }) => entry.id === newcomer.id).ownerId,
  ).toBe(recipe.ownerId);
  expect(
    after.find((entry: { id: string }) => entry.id === unrelated.id),
  ).toBeTruthy();
  expect(restored.imageUrl).not.toBe(imageUrl);
  expect(await (await request.get(restored.imageUrl)).body()).toEqual(photo);
  const second = await request.post("/api/backup", {
    multipart: { file: part(backup), action: "restore" },
  });
  expect(second.ok()).toBeTruthy();
  expect((await (await request.get("/api/recipes")).json()).length).toBe(
    after.length,
  );
  await page.goto(`/recipes/${recipe.id}`);
  await expect(
    page.getByRole("button", { name: "Remove from favorites", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Personal notes", { exact: true })).toHaveValue(
    "Keep my note",
  );
});

test("invalid backups leave recipes untouched and preview errors translate on mobile", async ({
  page,
  request,
}) => {
  const before = await (await request.get("/api/recipes")).json();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/profile");
  await page.locator("#backup-file").setInputFiles({
    name: "bad.json.gz",
    mimeType: "application/gzip",
    buffer: gzipSync('{"format":"recipes-app","version":99}'),
  });
  await page
    .getByRole("button", { name: "Preview restore", exact: true })
    .click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "This file is invalid",
  );
  await page.getByRole("button", { name: "BG", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "Файлът е невалиден",
  );
  await expect(
    page.getByRole("heading", {
      name: "Резервни копия на рецептите",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const result = await request.post("/api/backup", {
    multipart: {
      action: "restore",
      file: {
        name: "bad.gz",
        mimeType: "application/gzip",
        buffer: Buffer.from("not a backup"),
      },
    },
  });
  expect(result.status()).toBe(400);
  expect(await (await request.get("/api/recipes")).json()).toEqual(before);
});

test("guests and regular members cannot export or restore, and cross-origin restores are rejected", async ({
  page,
  context,
  request,
  browser,
  baseURL,
}) => {
  expect(
    (
      await request.post("/api/backup", {
        headers: { origin: "https://other.example" },
      })
    ).status(),
  ).toBe(403);
  await context.clearCookies();
  expect((await context.request.get("/api/backup")).status()).toBe(403);
  expect((await context.request.post("/api/backup")).status()).toBe(403);
  const member = await browser.newContext({
    baseURL,
    storageState: { cookies: [], origins: [] },
    extraHTTPHeaders: {
      origin: baseURL ?? "",
      "x-forwarded-for": "203.0.113.200",
    },
  });
  try {
    const signup = await member.request.post("/api/auth/sign-up/email", {
      data: {
        name: "Backup member",
        email: `${randomUUID()}@example.test`,
        password: "Only-for-tests-password-123",
      },
    });
    expect(signup.ok()).toBeTruthy();
    expect((await member.request.get("/api/backup")).status()).toBe(403);
    expect((await member.request.post("/api/backup")).status()).toBe(403);
    const memberPage = await member.newPage();
    await memberPage.goto("/profile");
    await expect(
      memberPage.getByRole("button", { name: "Download backup", exact: true }),
    ).toHaveCount(0);
  } finally {
    await member.close();
  }
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/sign-in/);
});
