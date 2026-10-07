import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultRecipeFilters,
  filterAndSortRecipes,
  type RecipeFilters,
  UNASSIGNED_CREATOR,
} from "../src/lib/recipe-search";

const recipes = [
  {
    id: "soup",
    title: "Chicken soup",
    ingredients: "Rice\nSalt",
    categories: ["Chicken", "Soups"],
    ownerId: "alice",
    cookMinutes: 30,
    createdAt: new Date("2026-01-02"),
  },
  {
    id: "salad",
    title: "Green salad",
    ingredients: "Rice\nLemon",
    categories: ["Salads", "Vegetarian"],
    ownerId: "bob",
    cookMinutes: 15,
    createdAt: new Date("2026-01-03"),
  },
  {
    id: "bake",
    title: "Chicken bake",
    ingredients: "Potatoes\nSalt",
    categories: ["Chicken"],
    ownerId: "alice",
    cookMinutes: 60,
    createdAt: new Date("2026-01-04"),
  },
  {
    id: "legacy",
    title: "Рецепта 10",
    ingredients: "Кисело мляко\nМед",
    categories: [],
    ownerId: null,
    cookMinutes: null,
    createdAt: new Date("2026-01-01"),
  },
];

function find(
  overrides: Partial<RecipeFilters> = {},
  favoriteIds: string[] = [],
) {
  return filterAndSortRecipes(
    recipes,
    { ...defaultRecipeFilters(), ...overrides },
    favoriteIds,
    "en",
  ).map((recipe) => recipe.id);
}

test("search matches all words across titles and ingredients, including Bulgarian and whitespace", () => {
  assert.deepEqual(find({ query: "  CHICKEN   rice\n" }), ["soup"]);
  assert.deepEqual(find({ query: "КИСЕЛО МЛЯКО" }), ["legacy"]);
  assert.deepEqual(find({ query: "potato" }), ["bake"]);
  assert.deepEqual(find({ query: "rice potatoes" }), []);
  assert.deepEqual(find({ query: "  \n  " }), find());
});

test("category filters support intersection, union and no selection", () => {
  assert.deepEqual(find({ categories: ["Chicken", "Soups"] }), ["soup"]);
  assert.deepEqual(
    find({ categories: ["Chicken", "Salads"], categoryMatch: "any" }),
    ["bake", "salad", "soup"],
  );
  assert.deepEqual(find({ categories: ["Chicken", "Salads"] }), []);
  assert.deepEqual(find({ categories: [], categoryMatch: "any" }), find());
});

test("creator, cooking time, search, categories and private favorites combine", () => {
  assert.deepEqual(find({ creatorId: "alice" }), ["bake", "soup"]);
  assert.deepEqual(find({ creatorId: UNASSIGNED_CREATOR }), ["legacy"]);
  assert.deepEqual(find({ cookingTime: "30" }), ["salad", "soup"]);
  assert.deepEqual(find({ cookingTime: "unknown" }), ["legacy"]);
  assert.deepEqual(
    find(
      {
        creatorId: "alice",
        cookingTime: "30",
        query: "salt",
        categories: ["Chicken", "Soups"],
        favoritesOnly: true,
      },
      ["soup", "salad"],
    ),
    ["soup"],
  );
  assert.deepEqual(find({ favoritesOnly: true }, []), []);
});

test("all sort directions work without mutating inputs; unknown durations stay last", () => {
  const original = recipes.map((recipe) => recipe.id);
  assert.deepEqual(find(), ["bake", "salad", "soup", "legacy"]);
  assert.deepEqual(find({ sort: "oldest" }), [
    "legacy",
    "soup",
    "salad",
    "bake",
  ]);
  assert.deepEqual(find({ sort: "quickest" }), [
    "salad",
    "soup",
    "bake",
    "legacy",
  ]);
  assert.deepEqual(find({ sort: "longest" }), [
    "bake",
    "soup",
    "salad",
    "legacy",
  ]);
  assert.deepEqual(find({ sort: "titleAsc", query: "chicken" }), [
    "bake",
    "soup",
  ]);
  assert.deepEqual(find({ sort: "titleDesc", query: "chicken" }), [
    "soup",
    "bake",
  ]);
  assert.deepEqual(
    recipes.map((recipe) => recipe.id),
    original,
  );
});

test("title sorting uses natural numbers and stable ties for both interface languages", () => {
  const numbered = [
    { ...recipes[0], id: "10", title: "Рецепта 10" },
    { ...recipes[0], id: "2b", title: "Рецепта 2" },
    { ...recipes[0], id: "2a", title: "Рецепта 2" },
  ];
  for (const language of ["en", "bg"]) {
    assert.deepEqual(
      filterAndSortRecipes(
        numbered,
        { ...defaultRecipeFilters(), sort: "titleAsc" },
        [],
        language,
      ).map((recipe) => recipe.id),
      ["2a", "2b", "10"],
    );
  }
});
