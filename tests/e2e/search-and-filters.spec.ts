import { randomUUID } from "node:crypto";
import { dictionary } from "../../src/lib/dictionary";
import { adminCredentials } from "./auth-credentials.mjs";
import { expect, test } from "./fixtures";

test("search finds ingredients and combines words across the title and ingredient list", async ({
  page,
  makeRecipe,
}) => {
  const prefix = randomUUID().slice(0, 8);
  const soup = await makeRecipe({
    title: `${prefix} Chicken soup`,
    ingredients: "Rice\nSalt",
  });
  const salad = await makeRecipe({
    title: `${prefix} Salad`,
    ingredients: "Rice\nLemon",
  });
  const bulgarian = await makeRecipe({
    title: `${prefix} Закуска`,
    ingredients: "Кисело мляко\nМед",
  });
  await page.goto("/");
  const search = page.getByRole("searchbox", {
    name: dictionary.en["home.searchPlaceholder"],
  });
  await search.fill(`  ${prefix}  RICE chicken  `);
  await expect(
    page.getByRole("heading", { name: soup.title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: salad.title, exact: true }),
  ).toHaveCount(0);
  await search.fill(`${prefix} КИСЕЛО МЛЯКО`);
  await expect(
    page.getByRole("heading", { name: bulgarian.title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: soup.title, exact: true }),
  ).toHaveCount(0);
  await search.fill(`${prefix} rice мед`);
  await expect(
    page.getByText(dictionary.en["home.noSearchResults"], { exact: true }),
  ).toBeVisible();
});

test("multiple category selections toggle and support all/any matching", async ({
  page,
  makeRecipe,
}) => {
  const prefix = `Categories ${randomUUID().slice(0, 8)}`;
  const soup = await makeRecipe({
    title: `${prefix} soup`,
    categories: ["Chicken", "Soups"],
  });
  const bake = await makeRecipe({
    title: `${prefix} bake`,
    categories: ["Chicken"],
  });
  const salad = await makeRecipe({
    title: `${prefix} salad`,
    categories: ["Salads"],
  });
  await page.goto("/");
  await page.getByRole("searchbox").fill(prefix);
  await page.getByRole("button", { name: "Chicken", exact: true }).click();
  await page.getByRole("button", { name: "Soups", exact: true }).click();
  for (const category of ["Chicken", "Soups"])
    await expect(
      page.getByRole("button", { name: category, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("heading", { name: soup.title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: bake.title, exact: true }),
  ).toHaveCount(0);
  await page
    .getByLabel("Category matching", { exact: true })
    .selectOption("any");
  await expect(
    page.getByRole("heading", { name: bake.title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: salad.title, exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Chicken", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Chicken", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("heading", { name: bake.title, exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: salad.title, exact: true }),
  ).toBeVisible();
});

test("creator, duration, categories and personal favorites combine, and reset clears every control", async ({
  page,
  request,
  makeRecipe,
  playwright,
  baseURL,
}) => {
  if (!baseURL) throw new Error("Missing test base URL");
  const prefix = `Combined ${randomUUID().slice(0, 8)}`;
  const quick = await makeRecipe({ title: `${prefix} quick`, cookMinutes: 15 });
  const boundary = await makeRecipe({
    title: `${prefix} thirty`,
    cookMinutes: 30,
  });
  const slow = await makeRecipe({ title: `${prefix} slow`, cookMinutes: 60 });
  const unknown = await makeRecipe({
    title: `${prefix} unknown`,
    cookMinutes: null,
  });
  for (const recipe of [quick, unknown])
    expect(
      (
        await request.put(`/api/recipes/${recipe.id}/preference`, {
          data: { isFavorite: true },
        })
      ).ok(),
    ).toBeTruthy();
  const member = await playwright.request.newContext({
    baseURL,
    storageState: { cookies: [], origins: [] },
    extraHTTPHeaders: { origin: baseURL, "x-forwarded-for": "198.51.100.240" },
  });
  try {
    const signup = await member.post("/api/auth/sign-up/email", {
      data: {
        name: `Second cook ${prefix}`,
        email: `${randomUUID()}@example.test`,
        password: "Filter-test-password-123",
      },
    });
    expect(signup.ok()).toBeTruthy();
    const { user } = await signup.json();
    const created = await member.post("/api/recipes", {
      data: {
        title: `${prefix} member`,
        ingredients: "Rice",
        steps: "Cook",
        cookMinutes: 10,
        categories: ["Chicken", "Soups"],
      },
    });
    expect(created.status()).toBe(201);
    const memberRecipe = await created.json();
    await page.goto("/");
    await page.getByRole("searchbox").fill(prefix);
    await page
      .getByLabel("Cook / creator", { exact: true })
      .selectOption({ label: adminCredentials.name });
    await page.getByLabel("Cooking time", { exact: true }).selectOption("30");
    for (const recipe of [quick, boundary])
      await expect(
        page.getByRole("heading", { name: recipe.title, exact: true }),
      ).toBeVisible();
    for (const recipe of [slow, unknown, memberRecipe])
      await expect(
        page.getByRole("heading", { name: recipe.title, exact: true }),
      ).toHaveCount(0);
    await page
      .getByRole("checkbox", { name: "My favorites only", exact: true })
      .check();
    for (const category of ["Chicken", "Soups"])
      await page.getByRole("button", { name: category, exact: true }).click();
    await expect(
      page.getByRole("heading", { name: quick.title, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: boundary.title, exact: true }),
    ).toHaveCount(0);
    await expect(page.getByRole("status")).toHaveText("1 recipe");
    await page.getByLabel("Sort by", { exact: true }).selectOption("longest");
    await page
      .getByLabel("Cooking time", { exact: true })
      .selectOption("unknown");
    await expect(
      page.getByRole("heading", { name: unknown.title, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: quick.title, exact: true }),
    ).toHaveCount(0);
    await page
      .getByRole("button", { name: "Reset filters", exact: true })
      .click();
    await expect(page.getByRole("searchbox")).toHaveValue("");
    await expect(
      page.getByLabel("Cook / creator", { exact: true }),
    ).toHaveValue("");
    await expect(page.getByLabel("Cooking time", { exact: true })).toHaveValue(
      "any",
    );
    await expect(
      page.getByLabel("Category matching", { exact: true }),
    ).toHaveValue("all");
    await expect(page.getByLabel("Sort by", { exact: true })).toHaveValue(
      "newest",
    );
    await expect(
      page.getByRole("checkbox", { name: "My favorites only", exact: true }),
    ).not.toBeChecked();
    await expect(
      page.getByRole("button", { name: "All", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("heading", { name: slow.title, exact: true }),
    ).toBeVisible();
    await page.getByRole("searchbox").fill(prefix);
    await page
      .getByLabel("Cook / creator", { exact: true })
      .selectOption(user.id);
    await expect(
      page.getByRole("heading", { name: memberRecipe.title, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: quick.title, exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByText(`Added by: ${user.name}`, { exact: true }),
    ).toBeVisible();
  } finally {
    await member.dispose();
  }
});

test("sorting changes the displayed order and puts unknown durations last in both directions", async ({
  page,
  makeRecipe,
}) => {
  const prefix = `Sorting ${randomUUID().slice(0, 8)}`;
  const alpha = await makeRecipe({ title: `${prefix} Alpha`, cookMinutes: 15 });
  const beta = await makeRecipe({ title: `${prefix} Beta`, cookMinutes: 60 });
  const gamma = await makeRecipe({
    title: `${prefix} Gamma`,
    cookMinutes: null,
  });
  await page.goto("/");
  await page.getByRole("searchbox").fill(prefix);
  const orders = {
    newest: [gamma.title, beta.title, alpha.title],
    oldest: [alpha.title, beta.title, gamma.title],
    titleAsc: [alpha.title, beta.title, gamma.title],
    titleDesc: [gamma.title, beta.title, alpha.title],
    quickest: [alpha.title, beta.title, gamma.title],
    longest: [beta.title, alpha.title, gamma.title],
  };
  for (const [sort, titles] of Object.entries(orders)) {
    await page.getByLabel("Sort by", { exact: true }).selectOption(sort);
    await expect(
      page.getByRole("main").getByRole("heading", { level: 2 }),
    ).toHaveText(titles);
  }
});

test("guests can use translated filters on mobile without losing selections", async ({
  page,
  context,
  makeRecipe,
}) => {
  const recipe = await makeRecipe({
    title: `Mobile ${randomUUID().slice(0, 8)}`,
    cookMinutes: 30,
  });
  await context.clearCookies();
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");
  await page.getByRole("searchbox").fill(recipe.title);
  for (const category of ["Chicken", "Soups"])
    await page.getByRole("button", { name: category, exact: true }).click();
  await page
    .getByLabel("Category matching", { exact: true })
    .selectOption("any");
  await page.getByLabel("Cooking time", { exact: true }).selectOption("30");
  await page.getByLabel("Sort by", { exact: true }).selectOption("titleAsc");
  await page.getByRole("button", { name: "BG", exact: true }).click();
  await expect(
    page.getByRole("searchbox", {
      name: dictionary.bg["home.searchPlaceholder"],
    }),
  ).toHaveValue(recipe.title);
  await expect(
    page.getByLabel(dictionary.bg["filters.categoryMatch"], { exact: true }),
  ).toHaveValue("any");
  await expect(
    page.getByLabel(dictionary.bg["filters.cookingTime"], { exact: true }),
  ).toHaveValue("30");
  await expect(
    page.getByLabel(dictionary.bg["filters.sort"], { exact: true }),
  ).toHaveValue("titleAsc");
  await expect(
    page.getByLabel(dictionary.bg["filters.creator"], { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Пилешко", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Супи", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status")).toHaveText("1 рецепта");
  await expect(
    page.getByRole("checkbox", {
      name: dictionary.bg["personal.onlyFavorites"],
      exact: true,
    }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(375);
  await page
    .getByRole("button", { name: dictionary.bg["filters.reset"], exact: true })
    .click();
  await expect(page.getByRole("searchbox")).toHaveValue("");
  await expect(
    page.getByRole("button", { name: "Всички", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
