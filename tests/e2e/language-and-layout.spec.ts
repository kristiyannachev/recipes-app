import { categories } from "../../src/constants/categories";
import { dictionary } from "../../src/lib/dictionary";
import { expect, test } from "./fixtures";

test("EN/BG switching translates categories without losing selections", async ({
  page,
  makeRecipe,
}) => {
  await makeRecipe({ categories: [...categories] });
  await page.goto("/recipes/new");
  await page.getByText("Chicken", { exact: true }).click();
  await page.getByText("Soups", { exact: true }).click();
  await page.getByRole("button", { name: "BG", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Нова Рецепта", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: "Пилешко", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Супи", exact: true }),
  ).toBeChecked();
  const categoryLabels = Object.entries(dictionary.bg)
    .filter(([key]) => key.startsWith("category.") && key !== "category.all")
    .map(([, label]) => label);
  for (const label of categoryLabels)
    await expect(
      page.getByRole("checkbox", { name: label, exact: true }),
    ).toBeVisible();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(
    page.getByRole("checkbox", { name: "Chicken", exact: true }),
  ).toBeChecked();
});

test("filters and recipe badges translate when language changes", async ({
  page,
  makeRecipe,
}) => {
  const recipe = await makeRecipe({ categories: ["Salads", "Vegetarian"] });
  await page.goto("/");
  await page.getByRole("button", { name: "BG", exact: true }).click();
  await page.getByRole("button", { name: "Салати", exact: true }).click();
  const card = page.getByRole("link").filter({
    has: page.getByRole("heading", { name: recipe.title, exact: true }),
  });
  await expect(card.getByText("Салати", { exact: true })).toBeVisible();
  await expect(card.getByText("Вегетариански", { exact: true })).toBeVisible();
  await card.click();
  await expect(page).toHaveURL(new RegExp(`/recipes/${recipe.id}$`));
  await expect(page.getByText(/Салати$/)).toBeVisible();
});

for (const width of [375, 1280]) {
  test(`global controls reserve space on every page at ${width}px`, async ({
    page,
    makeRecipe,
  }) => {
    const recipe = await makeRecipe();
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/",
      "/recipes/new",
      `/recipes/${recipe.id}`,
      `/recipes/${recipe.id}/edit`,
      "/cart",
      `/recipes/${recipe.id}/cook`,
    ]) {
      await page.goto(path);
      const nav = page.getByRole("navigation", { name: "App controls" });
      await expect(
        nav.getByRole("button", { name: "EN", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Shopping Cart", exact: true }),
      ).toHaveCount(1);
      const navBounds = await nav.boundingBox();
      const contentBounds = await page.getByRole("main").boundingBox();
      expect(navBounds).not.toBeNull();
      expect(contentBounds).not.toBeNull();
      if (!navBounds || !contentBounds)
        throw new Error(`Missing layout bounds on ${path}`);
      expect(
        navBounds.y + navBounds.height,
        `Navigation overlaps ${path}`,
      ).toBeLessThanOrEqual(contentBounds.y);
    }
  });
}
