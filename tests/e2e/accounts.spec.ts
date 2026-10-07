import { randomUUID } from "node:crypto";
import type {
  APIRequestContext,
  Browser,
  BrowserContext,
  Request as BrowserRequest,
} from "@playwright/test";
import { dictionary } from "../../src/lib/dictionary";
import { adminCredentials } from "./auth-credentials.mjs";
import { expect, type TestRecipe, test } from "./fixtures";

let memberIp = 1;
const password = "Only-for-tests-password-123";

async function memberContext(browser: Browser, baseURL: string | undefined) {
  if (!baseURL) throw new Error("Missing test base URL");
  const context = await browser.newContext({
    baseURL,
    storageState: { cookies: [], origins: [] },
    extraHTTPHeaders: {
      origin: baseURL,
      "x-forwarded-for": `198.51.100.${memberIp++}`,
    },
  });
  const response = await context.request.post("/api/auth/sign-up/email", {
    data: {
      name: "Member cook",
      email: `${randomUUID()}@example.test`,
      password,
    },
  });
  expect(response.status()).toBe(200);
  const { user } = await response.json();
  expect(user.role).toBe("user");
  const forged = await context.request.post("/api/auth/update-user", {
    headers: { origin: baseURL ?? "http://127.0.0.1:3100" },
    data: { role: "admin" },
  });
  expect(forged.status()).toBe(400);
  expect((await forged.json()).code).toBe("FIELD_NOT_ALLOWED");
  return { context, user };
}

async function createRecipe(
  request: APIRequestContext,
  data: Record<string, unknown> = {},
) {
  const response = await request.post("/api/recipes", {
    data: {
      title: `Member recipe ${randomUUID().slice(0, 8)}`,
      ingredients: "Rice",
      steps: "Cook",
      ...data,
    },
  });
  expect(response.status()).toBe(201);
  return response.json() as Promise<TestRecipe & { ownerId: string }>;
}

function replayAction(context: BrowserContext, captured: BrowserRequest) {
  return context.request.post(captured.url(), {
    headers: {
      "next-action": captured.headers()["next-action"],
      "content-type": captured.headers()["content-type"],
    },
    data: captured.postDataBuffer() ?? undefined,
  });
}

test("guests can browse, cook and shop; creating, editing and uploads require sign-in", async ({
  page,
  context,
  browser,
  baseURL,
  makeRecipe,
}) => {
  const recipe = await makeRecipe();
  await context.clearCookies();
  await page.goto(`/recipes/${recipe.id}`);
  await expect(
    page.getByRole("heading", { name: recipe.title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Edit", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Delete", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", {
      name: dictionary.en["recipe.startCooking"],
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "Next Step", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Exit", exact: true }).click();
  await page.getByRole("button", { name: /Add to Cart$/ }).click();
  await page.getByRole("link", { name: "Shopping Cart", exact: true }).click();
  await expect(page.getByText(recipe.title, { exact: true })).toBeVisible();
  await page.goto("/recipes/new");
  await expect(page).toHaveURL(/\/sign-in\?next=/);
  const guest = await browser.newContext({
    baseURL,
    storageState: { cookies: [], origins: [] },
  });
  try {
    expect((await guest.request.get("/api/recipes")).status()).toBe(200);
    expect(
      (
        await guest.request.post("/api/recipes", {
          data: { title: "Unauthorized" },
        })
      ).status(),
    ).toBe(401);
    expect((await guest.request.post("/api/upload")).status()).toBe(401);
    expect(
      (
        await guest.request.put(`/api/recipes/${recipe.id}/preference`, {
          data: { note: "No" },
        })
      ).status(),
    ).toBe(401);
  } finally {
    await guest.close();
  }
});

test("email registration, translated sign-in errors, session persistence and sign-out work", async ({
  page,
  context,
  baseURL,
}) => {
  await context.clearCookies();
  await page.goto("/sign-up?next=/recipes/new");
  const email = `${randomUUID()}@example.test`;
  await page.getByLabel("Your name", { exact: true }).fill("New cook");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL(new URL("/recipes/new", baseURL).toString());
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Sign out", exact: true }),
  ).toBeVisible();
  const oldCookies = await context.cookies();
  const cookie = oldCookies.find((item) => item.name.includes("session_token"));
  expect(cookie).toMatchObject({ httpOnly: true, sameSite: "Lax" });
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/sign-in/);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill("Wrong-password-123");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    dictionary.en["error.credentials"],
  );
  await page.getByRole("button", { name: "BG", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    dictionary.bg["error.credentials"],
  );
  await page.getByLabel("Парола", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Вход", exact: true }).click();
  await expect(page).toHaveURL(new URL("/recipes/new", baseURL).toString());
  await expect(
    page.getByRole("heading", { name: "Нова Рецепта", exact: true }),
  ).toBeVisible();
  await context.clearCookies();
  await context.addCookies(oldCookies);
  await page.goto("/recipes/new");
  await expect(page).toHaveURL(/\/sign-in/);
});

test("recipes belong to their creator; owners can edit and administrators can edit other cooks' recipes", async ({
  browser,
  baseURL,
  page,
}) => {
  const { context, user } = await memberContext(browser, baseURL);
  try {
    const recipe = await createRecipe(context.request, {
      ownerId: "forged-owner",
    });
    expect(recipe.ownerId).toBe(user.id);
    const member = await context.newPage();
    await member.goto(`/recipes/${recipe.id}`);
    await expect(
      member.getByText("Added by: Member cook", { exact: true }),
    ).toBeVisible();
    await expect(
      member.getByRole("button", { name: "Delete", exact: true }),
    ).toHaveCount(0);
    await member.getByRole("link", { name: "Edit", exact: true }).click();
    await member
      .getByLabel("Title", { exact: true })
      .fill("Owner edited recipe");
    await member
      .getByRole("button", { name: "Save Changes", exact: true })
      .click();
    await expect(
      member.getByRole("heading", { name: "Owner edited recipe", exact: true }),
    ).toBeVisible();
    await page.goto(`/recipes/${recipe.id}/edit`);
    await page
      .getByLabel("Title", { exact: true })
      .fill("Administrator edited recipe");
    await page
      .getByRole("button", { name: "Save Changes", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Administrator edited recipe",
        exact: true,
      }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await page
      .getByRole("button", { name: "Confirm Delete", exact: true })
      .click();
    await expect(page).toHaveURL(/\/$/);
  } finally {
    await context.close();
  }
});

test("forged server actions cannot edit or delete another cook's recipe", async ({
  browser,
  baseURL,
  page,
  makeRecipe,
  request,
}) => {
  const recipe = await makeRecipe();
  const { context } = await memberContext(browser, baseURL);
  const guest = await browser.newContext({
    baseURL,
    storageState: { cookies: [], origins: [] },
  });
  try {
    const other = await context.newPage();
    await other.goto(`/recipes/${recipe.id}/edit`);
    await expect(
      other.getByRole("heading", { name: "Page not found", exact: true }),
    ).toBeVisible();
    await page.goto(`/recipes/${recipe.id}/edit`);
    await page.getByLabel("Title", { exact: true }).fill("Unauthorized edit");
    await page.route(`**/recipes/${recipe.id}/edit`, (route) =>
      route.request().method() === "POST" ? route.abort() : route.continue(),
    );
    const capturedEdit = page.waitForRequest(
      (req) => req.method() === "POST" && !!req.headers()["next-action"],
    );
    await page
      .getByRole("button", { name: "Save Changes", exact: true })
      .click();
    const edit = await capturedEdit;
    expect(await (await replayAction(context, edit)).text()).toContain(
      "error.forbidden",
    );
    expect(await (await replayAction(guest, edit)).text()).toContain(
      "error.signInRequired",
    );
    await page.goto(`/recipes/${recipe.id}`);
    await page.route(`**/recipes/${recipe.id}`, (route) =>
      route.request().method() === "POST" ? route.abort() : route.continue(),
    );
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    const capturedDelete = page.waitForRequest(
      (req) => req.method() === "POST" && !!req.headers()["next-action"],
    );
    await page
      .getByRole("button", { name: "Confirm Delete", exact: true })
      .click();
    const deletion = await capturedDelete;
    expect((await replayAction(context, deletion)).ok()).toBe(false);
    expect((await replayAction(guest, deletion)).ok()).toBe(false);
    const recipes: TestRecipe[] = await (
      await request.get("/api/recipes")
    ).json();
    expect(recipes.find((item) => item.id === recipe.id)?.title).toBe(
      recipe.title,
    );
  } finally {
    await context.close();
    await guest.close();
  }
});

test("favorites and notes persist privately per account, including across language changes and logout", async ({
  page,
  context,
  browser,
  baseURL,
  makeRecipe,
  request,
}) => {
  const recipe = await makeRecipe();
  const other = await makeRecipe();
  // Give this test its own session before testing revocation.
  const login = await context.request.post("/api/auth/sign-in/email", {
    headers: { origin: baseURL ?? "http://127.0.0.1:3100" },
    data: {
      email: adminCredentials.email,
      password: adminCredentials.password,
    },
  });
  expect(login.ok()).toBeTruthy();
  await page.goto(`/recipes/${recipe.id}`);
  await page
    .getByRole("button", { name: "Add to favorites", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Remove from favorites", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByLabel("Personal notes", { exact: true })
    .fill("Private family tip");
  await page.getByRole("button", { name: "Save note", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Note saved.");
  await page.reload();
  await expect(page.getByLabel("Personal notes", { exact: true })).toHaveValue(
    "Private family tip",
  );
  await page.goto("/");
  await page
    .getByRole("checkbox", { name: "My favorites only", exact: true })
    .check();
  await expect(
    page.getByRole("heading", { name: recipe.title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: other.title, exact: true }),
  ).toHaveCount(0);
  const { context: member, user: memberUser } = await memberContext(
    browser,
    baseURL,
  );
  try {
    const memberPage = await member.newPage();
    await memberPage.goto(`/recipes/${recipe.id}`);
    await expect(
      memberPage.getByLabel("Personal notes", { exact: true }),
    ).toHaveValue("");
    await expect(
      memberPage.getByRole("button", { name: "Add to favorites", exact: true }),
    ).toBeVisible();
    await member.request.put(`/api/recipes/${recipe.id}/preference`, {
      data: { note: "Another cook's tip", userId: "forged-id" },
    });
    await page.goto(`/recipes/${recipe.id}`);
    await expect(
      page.getByLabel("Personal notes", { exact: true }),
    ).toHaveValue("Private family tip");
    await page.getByRole("button", { name: "BG", exact: true }).click();
    await expect(page.getByLabel("Лични бележки", { exact: true })).toHaveValue(
      "Private family tip",
    );
    const publicRecipes = await (await request.get("/api/recipes")).text();
    expect(publicRecipes).not.toContain("Private family tip");
    expect(publicRecipes).not.toContain("Another cook's tip");
    await page
      .getByRole("button", { name: "Изход от профила", exact: true })
      .click();
    await expect(page.getByLabel("Лични бележки", { exact: true })).toHaveCount(
      0,
    );
    expect(await page.locator("main").innerText()).not.toContain(
      "Private family tip",
    );
    expect(
      (
        await context.request.put(`/api/recipes/${recipe.id}/preference`, {
          data: { note: "No session" },
        })
      ).status(),
    ).toBe(401);
    await page.goto(
      `/sign-in?next=${encodeURIComponent(`/recipes/${recipe.id}`)}`,
    );
    await page.getByLabel("Имейл", { exact: true }).fill(memberUser.email);
    await page.getByLabel("Парола", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Вход", exact: true }).click();
    await expect(page).toHaveURL(
      new URL(`/recipes/${recipe.id}`, baseURL).toString(),
    );
    await expect(page.getByLabel("Лични бележки", { exact: true })).toHaveValue(
      "Another cook's tip",
    );
    expect(await page.locator("main").innerText()).not.toContain(
      "Private family tip",
    );
  } finally {
    await member.close();
  }
});

test("preference validation and origin checks reject unsafe mutations", async ({
  request,
  makeRecipe,
}) => {
  const recipe = await makeRecipe();
  const forgedRole = await request.post("/api/auth/sign-up/email", {
    data: {
      name: "Forged administrator",
      email: `${randomUUID()}@example.test`,
      password,
      role: "admin",
    },
    headers: {
      origin: new URL((await request.get("/api/recipes")).url()).origin,
    },
  });
  expect(forgedRole.status()).toBe(200);
  expect((await forgedRole.json()).user.role).toBe("user");
  for (const data of [
    { isFavorite: "yes" },
    { note: "x".repeat(5001) },
    { note: 42 },
    {},
  ]) {
    expect(
      (
        await request.put(`/api/recipes/${recipe.id}/preference`, { data })
      ).status(),
    ).toBe(400);
  }
  const forbidden = {
    headers: { origin: "https://untrusted.example" },
    data: { note: "Unexpected" },
  };
  expect(
    (
      await request.put(`/api/recipes/${recipe.id}/preference`, forbidden)
    ).status(),
  ).toBe(403);
  expect((await request.post("/api/recipes", forbidden)).status()).toBe(403);
  expect((await request.post("/api/upload", forbidden)).status()).toBe(403);
  expect(
    (
      await request.put("/api/recipes/no-such-recipe/preference", {
        data: { note: "Missing" },
      })
    ).status(),
  ).toBe(404);
  const valid = await request.put(`/api/recipes/${recipe.id}/preference`, {
    data: { note: "Valid note", isFavorite: true },
  });
  expect(await valid.json()).toEqual({ note: "Valid note", isFavorite: true });
  const toggle = await request.put(`/api/recipes/${recipe.id}/preference`, {
    data: { isFavorite: false },
  });
  expect(await toggle.json()).toEqual({
    note: "Valid note",
    isFavorite: false,
  });
});
