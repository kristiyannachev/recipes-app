import { randomUUID } from "node:crypto";
import { test as base, expect } from "@playwright/test";

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

export const test = base.extend<Fixtures>({
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
