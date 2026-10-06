import { expect, test } from "./fixtures";

test("adding and removing a recipe updates the cart and badge", async ({
  page,
  makeRecipe,
}) => {
  const recipe = await makeRecipe();
  await page.goto(`/recipes/${recipe.id}`);
  await page.getByRole("button", { name: /Add to Cart$/ }).click();
  const cartLink = page.getByRole("link", {
    name: "Shopping Cart",
    exact: true,
  });
  await expect(cartLink.getByText("1", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /In Cart$/ })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /In Cart$/ }).click();
  await expect(cartLink.getByText("1", { exact: true })).toHaveCount(0);
  await cartLink.click();
  await expect(
    page.getByText("Your cart is empty.", { exact: true }),
  ).toBeVisible();
});

test("ingredient checklists persist and removing a recipe empties the cart", async ({
  page,
  makeRecipe,
}) => {
  const recipe = await makeRecipe();
  await page.goto(`/recipes/${recipe.id}`);
  await page.getByRole("button", { name: /Add to Cart$/ }).click();
  await page.getByRole("link", { name: "Shopping Cart", exact: true }).click();
  await expect(page.getByRole("checkbox")).toHaveCount(2);
  await page.getByRole("checkbox", { name: "Chicken", exact: true }).check();
  await page.reload();
  await expect(
    page.getByRole("checkbox", { name: "Chicken", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Salt", exact: true }),
  ).not.toBeChecked();
  await page.getByRole("button", { name: "Remove", exact: true }).click();
  await expect(
    page.getByText("Your cart is empty.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Your cart is empty.", { exact: true }),
  ).toBeVisible();
});

test("legacy string ingredients upgrade to a persistent checklist", async ({
  page,
  makeRecipe,
}) => {
  const recipe = await makeRecipe();
  await page.goto("/");
  await page.evaluate(
    (item) => localStorage.setItem("shoppingCart", JSON.stringify([item])),
    {
      recipeId: recipe.id,
      title: recipe.title,
      ingredients: ["Chicken", "Salt"],
    },
  );
  await page.goto("/cart");
  await page.getByRole("checkbox", { name: "Salt", exact: true }).check();
  await page.reload();
  await expect(
    page.getByRole("checkbox", { name: "Salt", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: "Chicken", exact: true }),
  ).not.toBeChecked();
});

test("clear-cart dialog supports keyboard cancellation and explicit confirmation", async ({
  page,
  makeRecipe,
}) => {
  const recipe = await makeRecipe();
  await page.goto(`/recipes/${recipe.id}`);
  await page.getByRole("button", { name: /Add to Cart$/ }).click();
  await page.getByRole("link", { name: "Shopping Cart", exact: true }).click();
  const originalCart = await page.evaluate(() =>
    localStorage.getItem("shoppingCart"),
  );
  const clearButton = page
    .getByRole("button", { name: "Clear Cart", exact: true })
    .first();
  const dialog = page.getByRole("dialog", {
    name: "Clear Shopping Cart?",
    exact: true,
  });
  await clearButton.click();
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "Clear Cart", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(clearButton).toBeFocused();
  expect(await page.evaluate(() => localStorage.getItem("shoppingCart"))).toBe(
    originalCart,
  );
  await clearButton.click();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem("shoppingCart"))).toBe(
    originalCart,
  );
  await clearButton.click();
  await dialog.getByRole("button", { name: "Clear Cart", exact: true }).click();
  await expect(
    page.getByText("Your cart is empty.", { exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("shoppingCart"))).toBe(
    "[]",
  );
  await page.reload();
  await expect(
    page.getByText("Your cart is empty.", { exact: true }),
  ).toBeVisible();
});
