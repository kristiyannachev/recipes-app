import { expect, type TestRecipe, test } from "./fixtures";

test("recipe API rejects missing fields and invalid category payloads", async ({
  request,
}) => {
  const before: TestRecipe[] = await (await request.get("/api/recipes")).json();
  const missingFields = await request.post("/api/recipes", {
    data: { title: "Incomplete" },
  });
  expect(missingFields.status()).toBe(400);
  expect((await missingFields.json()).errorCode).toBe(
    "error.recipeRequiredFields",
  );
  for (const categories of ["Chicken", ["Unknown"], ["Пилешко"], [42], null]) {
    const response = await request.post("/api/recipes", {
      data: { title: "Invalid", ingredients: "One", steps: "Cook", categories },
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).errorCode).toBe("error.invalidCategories");
  }
  expect((await (await request.get("/api/recipes")).json()).length).toBe(
    before.length,
  );
});

test("recipe API deduplicates categories and permits uncategorized recipes", async ({
  request,
  makeRecipe,
}) => {
  const recipe = await makeRecipe({
    categories: ["Chicken", "Soups", "Chicken"],
  });
  expect(recipe.categories).toEqual(["Chicken", "Soups"]);
  const response = await request.post("/api/recipes", {
    data: { title: "Uncategorized", ingredients: "One", steps: "Cook" },
  });
  expect(response.status()).toBe(201);
  expect((await response.json()).categories).toEqual([]);
});
