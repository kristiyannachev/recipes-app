import { randomUUID } from "node:crypto";
import { test as base, expect } from "@playwright/test";
import { adminCredentials } from "./auth-credentials.mjs";

export interface TestRecipe {
  id: string;
  title: string;
  description: string | null;
  ingredients: string;
  steps: string;
  cookMinutes: number | null;
  sourceUrl: string | null;
  categories: string[];
}

type RecipeInput = Omit<TestRecipe, "id">;
type Fixtures = {
  makeRecipe: (overrides?: Partial<RecipeInput>) => Promise<TestRecipe>;
  runtimeChecks: undefined;
};

type AuthStorage = Awaited<
  ReturnType<import("@playwright/test").APIRequestContext["storageState"]>
>;

let testIp = 1;

export const test = base.extend<Fixtures, { adminStorage: AuthStorage }>({
  adminStorage: [
    async ({ playwright }, use, workerInfo) => {
      const request = await playwright.request.newContext({
        baseURL: `http://127.0.0.1:${process.env.RECIPES_TEST_PORT ?? "3100"}`,
        extraHTTPHeaders: {
          "x-forwarded-for": `192.0.2.${workerInfo.workerIndex + 1}`,
        },
      });
      try {
        const result = await request.post("/api/auth/sign-in/email", {
          data: {
            email: adminCredentials.email,
            password: adminCredentials.password,
          },
        });
        expect(result.ok()).toBeTruthy();
        await use(await request.storageState());
      } finally {
        await request.dispose();
      }
    },
    { scope: "worker" },
  ],
  extraHTTPHeaders: async ({ baseURL }, use, testInfo) => {
    if (!baseURL) throw new Error("Missing test base URL");
    await use({
      origin: baseURL,
      "x-forwarded-for": `198.18.${testInfo.workerIndex}.${testIp++}`,
    });
  },
  storageState: async ({ adminStorage }, use) => {
    await use(adminStorage);
  },
  makeRecipe: async ({ request }, use) => {
    await use(async (overrides = {}) => {
      const response = await request.post("/api/recipes", {
        data: {
          title: `Test recipe ${randomUUID().slice(0, 8)}`,
          description: "A recipe for testing",
          ingredients: "Chicken\n\nSalt\n",
          steps: "Boil the water\n\nAdd the chicken\nServe\n",
          cookMinutes: 30,
          sourceUrl: null,
          categories: ["Chicken", "Soups"],
          ...overrides,
        },
      });
      expect(response.status()).toBe(201);
      return response.json();
    });
  },
  runtimeChecks: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await use(undefined);
      expect(errors, "Browser runtime errors").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
