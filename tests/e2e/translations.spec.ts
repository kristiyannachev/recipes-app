import { randomUUID } from "node:crypto";
import type { Page } from "@playwright/test";
import { dictionary } from "../../src/lib/dictionary";
import { expect, test } from "./fixtures";

test("missing pages offer translated messages and a working way home", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "BG", exact: true }).click();
  for (const path of ["/recipes/no-such-recipe", "/missing-page"]) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", {
        name: dictionary.bg["page.notFoundTitle"],
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(dictionary.bg["page.notFoundMessage"], { exact: true }),
    ).toBeVisible();
  }
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: dictionary.en["page.notFoundTitle"],
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Back to recipes", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
});

test("failed deletions show translated feedback and can be retried", async ({
  page,
  makeRecipe,
}) => {
  const recipe = await makeRecipe();
  await page.goto(`/recipes/${recipe.id}`);
  await page.getByRole("button", { name: "BG", exact: true }).click();
  await page.route(`**/recipes/${recipe.id}`, (route) =>
    route.request().method() === "POST" ? route.abort() : route.continue(),
  );
  await page.getByRole("button", { name: "Изтрий", exact: true }).click();
  await page
    .getByRole("button", { name: "Потвърди изтриването", exact: true })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: dictionary.bg["error.deleteRecipe"] }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: recipe.title, exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Отказ", exact: true }).click();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.unroute(`**/recipes/${recipe.id}`);
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page
    .getByRole("button", { name: "Confirm Delete", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: recipe.title, exact: true }),
  ).toHaveCount(0);
});

async function fillBulgarianRecipe(page: Page) {
  await page
    .getByLabel("Заглавие", { exact: true })
    .fill(`Language ${randomUUID().slice(0, 8)}`);
  await page.getByLabel("Съставки (по една на ред)").fill("Chicken\nSalt");
  await page.getByLabel("Стъпки", { exact: true }).fill("Boil\nServe");
}

test("language persists after refresh, navigation, and a new browser session", async ({
  page,
  context,
  browser,
  baseURL,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "BG", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "bg");
  await expect(page).toHaveTitle(dictionary.bg["app.title"]);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "BG", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "+ Нова Рецепта", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Нова Рецепта", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Управление на приложението" }),
  ).toBeVisible();
  expect(
    (await context.cookies()).find(
      (cookie) => cookie.name === "recipeLanguage",
    ),
  ).toMatchObject({ value: "bg", path: "/", sameSite: "Lax" });

  const freshContext = await browser.newContext({
    baseURL,
    storageState: await context.storageState(),
    javaScriptEnabled: false,
  });
  try {
    const freshPage = await freshContext.newPage();
    await freshPage.goto("/recipes/new");
    await expect(freshPage.locator("html")).toHaveAttribute("lang", "bg");
    await expect(freshPage).toHaveTitle(dictionary.bg["app.title"]);
    await expect(
      freshPage.getByRole("heading", { name: "Нова Рецепта", exact: true }),
    ).toBeVisible();
  } finally {
    await freshContext.close();
  }
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle(dictionary.en["app.title"]);
  await expect(
    page.getByRole("heading", { name: "New Recipe", exact: true }),
  ).toBeVisible();
});

test("an unsupported language cookie falls back to English", async ({
  page,
  context,
  baseURL,
}) => {
  if (!baseURL) throw new Error("Missing test base URL");
  await context.addCookies([
    { name: "recipeLanguage", value: "unsupported", url: baseURL },
  ]);
  await page.goto("/recipes/new");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", { name: "New Recipe", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "BG", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "bg");
});

test("Bulgarian labels cover recipe cards, cooking, cart controls, and dialogs", async ({
  page,
  makeRecipe,
}) => {
  const recipe = await makeRecipe();
  await page.goto("/");
  await page.getByRole("button", { name: "BG", exact: true }).click();
  const card = page.getByRole("link").filter({
    has: page.getByRole("heading", { name: recipe.title, exact: true }),
  });
  await expect(card.getByText("30 мин", { exact: true })).toBeVisible();
  await card.click();
  await expect(page).toHaveURL(new RegExp(`/recipes/${recipe.id}$`));
  await page.getByRole("button", { name: "Започни готвене" }).click();
  await expect(
    page.getByRole("button", { name: "Следваща стъпка", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Изход", exact: true }).click();
  await page.getByRole("button", { name: /Добави$/ }).click();
  await page.getByRole("link", { name: "Количка", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Премахни", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Изчисти", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Изчистване на количката?" });
  await expect(
    dialog.getByText(dictionary.bg["cart.confirmClear"], { exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Отказ", exact: true }).click();
  await page.getByRole("button", { name: "Премахни", exact: true }).click();
  await expect(
    page.getByText("Количката е празна.", { exact: true }),
  ).toBeVisible();
});

test("form validation translates on language changes and clears after corrections", async ({
  page,
}) => {
  await page.goto("/recipes/new");
  const title = page.getByLabel("Title", { exact: true });
  await page
    .getByRole("button", { name: "Create Recipe", exact: true })
    .click();
  await expect
    .poll(() =>
      title.evaluate((input: HTMLInputElement) => input.validationMessage),
    )
    .toBe(dictionary.en["validation.required"]);
  await page.getByRole("button", { name: "BG", exact: true }).click();
  const bgTitle = page.getByLabel("Заглавие", { exact: true });
  await expect
    .poll(() =>
      bgTitle.evaluate((input: HTMLInputElement) => input.validationMessage),
    )
    .toBe(dictionary.bg["validation.required"]);
  await fillBulgarianRecipe(page);
  await expect
    .poll(() =>
      bgTitle.evaluate((input: HTMLInputElement) => input.validationMessage),
    )
    .toBe("");
  const source = page.getByLabel("URL на източника", { exact: true });
  await source.fill("invalid-url");
  await page
    .getByRole("button", { name: "Създай рецепта", exact: true })
    .click();
  await expect
    .poll(() =>
      source.evaluate((input: HTMLInputElement) => input.validationMessage),
    )
    .toBe(dictionary.bg["validation.url"]);
  await source.fill("https://example.com/recipe");
  const minutes = page.getByLabel("Време за готвене (минути)");
  for (const value of ["0", "1.5"]) {
    await minutes.fill(value);
    await page
      .getByRole("button", { name: "Създай рецепта", exact: true })
      .click();
    await expect
      .poll(() =>
        minutes.evaluate((input: HTMLInputElement) => input.validationMessage),
      )
      .toBe(dictionary.bg["validation.cookTime"]);
  }
  await minutes.fill("15");
  await page
    .getByRole("button", { name: "Създай рецепта", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", {
      name: dictionary.bg["app.title"],
      exact: true,
    }),
  ).toBeVisible();
});

test("create errors translate without losing form values or exposing raw server text", async ({
  page,
}) => {
  await page.route("**/api/recipes", (route) =>
    route.fulfill({
      status: 500,
      json: { error: "Internal server details", errorCode: "unrecognized" },
    }),
  );
  await page.goto("/recipes/new");
  await page.getByRole("button", { name: "BG", exact: true }).click();
  await fillBulgarianRecipe(page);
  const title = await page.getByLabel("Заглавие", { exact: true }).inputValue();
  await page
    .getByRole("button", { name: "Създай рецепта", exact: true })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: dictionary.bg["error.createRecipe"] }),
  ).toBeVisible();
  await expect(page.getByLabel("Заглавие", { exact: true })).toHaveValue(title);
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: dictionary.en["error.createRecipe"] }),
  ).toBeVisible();
  await page.unroute("**/api/recipes");
  await page.route("**/api/recipes", (route) =>
    route.fulfill({
      status: 400,
      json: {
        error: "Categories must be an array of supported category names.",
        errorCode: "error.invalidCategories",
      },
    }),
  );
  await page
    .getByRole("button", { name: "Create Recipe", exact: true })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: dictionary.en["error.invalidCategories"] }),
  ).toBeVisible();
  await page.getByRole("button", { name: "BG", exact: true }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: dictionary.bg["error.invalidCategories"] }),
  ).toBeVisible();
});

test("image picker, upload progress, preview, and failures translate", async ({
  page,
}) => {
  let finishUpload: () => void = () => undefined;
  const uploadReady = new Promise<void>((resolve) => {
    finishUpload = resolve;
  });
  await page.route("**/api/upload", async (route) => {
    await uploadReady;
    await route.fulfill({
      status: 500,
      json: { error: "Image upload failed", errorCode: "error.uploadImage" },
    });
  });
  try {
    await page.goto("/recipes/new");
    await page.getByRole("button", { name: "BG", exact: true }).click();
    await expect(
      page.getByText("Няма избрана снимка", { exact: true }),
    ).toBeVisible();
    const chooserReady = page.waitForEvent("filechooser");
    await page
      .getByRole("button", { name: "Избери снимка", exact: true })
      .click();
    const chooser = await chooserReady;
    await chooser.setFiles({
      name: "test.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aXioAAAAASUVORK5CYII=",
        "base64",
      ),
    });
    await expect(
      page.getByText("Качване на снимка...", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Създай рецепта", exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole("img", { name: "Преглед на снимката", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("test.png", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(
      page.getByText("Uploading image...", { exact: true }),
    ).toBeVisible();
    finishUpload();
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: dictionary.en["error.uploadImage"] }),
    ).toBeVisible();
    await page.getByRole("button", { name: "BG", exact: true }).click();
    await expect(
      page
        .getByRole("alert")
        .filter({ hasText: dictionary.bg["error.uploadImage"] }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Избери снимка", exact: true }),
    ).toBeEnabled();
  } finally {
    finishUpload();
  }
});

test("edit errors translate and retain values, then allow a corrected save", async ({
  page,
  makeRecipe,
}) => {
  const recipe = await makeRecipe();
  await page.goto(`/recipes/${recipe.id}/edit`);
  await page.getByRole("button", { name: "BG", exact: true }).click();
  const editedTitle = `${recipe.title} edited`;
  await page.getByLabel("Заглавие", { exact: true }).fill(editedTitle);
  await page.locator("form").evaluate((form) => {
    const invalidCategory = document.createElement("input");
    invalidCategory.type = "hidden";
    invalidCategory.name = "categories";
    invalidCategory.value = "unsupported";
    form.append(invalidCategory);
  });
  await page
    .getByRole("button", { name: "Запази промените", exact: true })
    .click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: dictionary.bg["error.invalidCategories"] }),
  ).toBeVisible();
  await expect(page.getByLabel("Заглавие", { exact: true })).toHaveValue(
    editedTitle,
  );
  await expect(
    page.getByRole("checkbox", { name: "Пилешко", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: dictionary.en["error.invalidCategories"] }),
  ).toBeVisible();
  await page
    .locator('input[value="unsupported"]')
    .evaluate((input) => input.remove());
  await page.getByRole("button", { name: "Save Changes", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/recipes/${recipe.id}$`));
  await expect(
    page.getByRole("heading", { name: editedTitle, exact: true }),
  ).toBeVisible();
});
