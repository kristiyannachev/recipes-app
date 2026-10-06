import { randomUUID } from "node:crypto";
import type { Page } from "@playwright/test";
import { expect, type TestRecipe, test } from "./fixtures";

async function fillNewRecipe(page: Page, title: string) {
  await page.getByLabel("Title", { exact: true }).fill(title);
  await page.getByLabel("Description", { exact: true }).fill("A warming soup");
  await page.getByLabel("Cook Time (minutes)").fill("25");
  await page.getByLabel("Ingredients (one per line)").fill("Chicken\nSalt");
  await page.getByLabel("Steps", { exact: true }).fill("Boil\nServe");
  await page.getByText("Chicken", { exact: true }).click();
  await page.getByText("Soups", { exact: true }).click();
}

test("creating a recipe saves its fields, categories, and source link", async ({
  page,
  request,
}) => {
  const title = `Created soup ${randomUUID().slice(0, 8)}`;
  const sourceUrl = "https://example.com/chicken-soup";
  await page.goto("/recipes/new");
  await fillNewRecipe(page, title);
  await page.getByLabel("Source URL").fill(sourceUrl);
  await page
    .getByRole("button", { name: "Create Recipe", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("heading", { name: title, exact: true }).click();
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "View Original Recipe Source" }),
  ).toHaveAttribute("href", sourceUrl);
  const recipes: TestRecipe[] = await (
    await request.get("/api/recipes")
  ).json();
  expect(recipes.find((recipe) => recipe.title === title)).toMatchObject({
    description: "A warming soup",
    cookMinutes: 25,
    ingredients: "Chicken\nSalt",
    steps: "Boil\nServe",
    sourceUrl,
    categories: ["Soups", "Chicken"],
  });
  await page.reload();
  await expect(page.getByText(/Soups$/)).toBeVisible();
});

test("editing restores category choices and saves changed fields", async ({
  page,
  request,
  makeRecipe,
}) => {
  const recipe = await makeRecipe({ categories: ["Breakfast", "Desserts"] });
  await page.goto(`/recipes/${recipe.id}/edit`);
  await expect(
    page.getByRole("checkbox", { name: "Breakfast", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Desserts", exact: true }),
  ).toBeChecked();
  await page
    .getByLabel("Title", { exact: true })
    .fill(`${recipe.title} edited`);
  await page.getByText("Breakfast", { exact: true }).click();
  await page.getByText("Desserts", { exact: true }).click();
  await page.getByText("Bread & Pastries", { exact: true }).click();
  await page.getByText("Cakes", { exact: true }).click();
  await page.getByRole("button", { name: "Save Changes", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/recipes/${recipe.id}$`));
  await expect(
    page.getByRole("heading", { name: `${recipe.title} edited`, exact: true }),
  ).toBeVisible();
  const saved: TestRecipe[] = await (await request.get("/api/recipes")).json();
  expect(saved.find((item) => item.id === recipe.id)?.categories).toEqual([
    "Bread & Pastries",
    "Cakes",
  ]);
  await page.goto(`/recipes/${recipe.id}/edit`);
  for (const checkbox of await page.getByRole("checkbox").all())
    if (await checkbox.isChecked()) await checkbox.press("Space");
  await page.getByRole("button", { name: "Save Changes", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/recipes/${recipe.id}$`));
  const cleared: TestRecipe[] = await (
    await request.get("/api/recipes")
  ).json();
  expect(cleared.find((item) => item.id === recipe.id)?.categories).toEqual([]);
});

test("search and filters find recipes assigned to more than one category", async ({
  page,
  makeRecipe,
}) => {
  const prefix = `Filter ${randomUUID().slice(0, 8)}`;
  const soup = await makeRecipe({
    title: `${prefix} soup`,
    categories: ["Chicken", "Soups"],
  });
  const cake = await makeRecipe({
    title: `${prefix} cake`,
    categories: ["Cakes", "Desserts"],
  });
  await page.goto("/");
  await page.getByPlaceholder("Search recipes...").fill(prefix);
  await expect(
    page.getByRole("heading", { name: soup.title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: cake.title, exact: true }),
  ).toBeVisible();
  for (const category of ["Chicken", "Soups"]) {
    await page.getByRole("button", { name: category, exact: true }).click();
    await expect(
      page.getByRole("heading", { name: soup.title, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: cake.title, exact: true }),
    ).toHaveCount(0);
  }
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: cake.title, exact: true }),
  ).toBeVisible();
  await page.getByPlaceholder("Search recipes...").fill("no-such-recipe-title");
  await expect(
    page.getByText("No recipes found.", { exact: true }),
  ).toBeVisible();
});

test("a failed save keeps form values and permits retry", async ({ page }) => {
  const title = `Retry ${randomUUID().slice(0, 8)}`;
  await page.route("**/api/recipes", (route) =>
    route.fulfill({ status: 503, json: { error: "Please try again" } }),
  );
  await page.goto("/recipes/new");
  await fillNewRecipe(page, title);
  await page
    .getByRole("button", { name: "Create Recipe", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Please try again" }),
  ).toHaveText("Please try again");
  await expect(page.getByLabel("Title", { exact: true })).toHaveValue(title);
  await expect(
    page.getByRole("checkbox", { name: "Chicken", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("button", { name: "Create Recipe", exact: true }),
  ).toBeEnabled();
  await page.unroute("**/api/recipes");
  await page
    .getByRole("button", { name: "Create Recipe", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: title, exact: true }),
  ).toBeVisible();
});

test("recipe deletion requires confirmation and persists", async ({
  page,
  request,
  makeRecipe,
}) => {
  const recipe = await makeRecipe();
  await page.goto(`/recipes/${recipe.id}`);
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Delete Recipe?", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: recipe.title, exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page
    .getByRole("button", { name: "Confirm Delete", exact: true })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: recipe.title, exact: true }),
  ).toHaveCount(0);
  const recipes: TestRecipe[] = await (
    await request.get("/api/recipes")
  ).json();
  expect(recipes.some((item) => item.id === recipe.id)).toBe(false);
  expect((await request.get(`/recipes/${recipe.id}`)).status()).toBe(404);
});

test("cooking mode ignores blank lines and can finish or exit", async ({
  page,
  makeRecipe,
}) => {
  const recipe = await makeRecipe();
  await page.goto(`/recipes/${recipe.id}`);
  const instructions = page
    .getByRole("list")
    .filter({ has: page.getByText("Boil the water", { exact: true }) });
  await expect(instructions.getByRole("listitem")).toHaveCount(3);
  await page.getByRole("button", { name: "Start Cooking" }).click();
  await page.getByRole("button", { name: "Next Step", exact: true }).click();
  await page.getByRole("button", { name: "Next Step", exact: true }).click();
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start Cooking" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start Cooking" }).click();
  await page.getByRole("button", { name: "Exit", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start Cooking" }),
  ).toBeVisible();
});
