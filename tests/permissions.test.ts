import assert from "node:assert/strict";
import test from "node:test";
import {
  canDeleteRecipe,
  canEditRecipe,
  safeReturnPath,
} from "../src/lib/permissions";

test("only owners and administrators can edit; only administrators can delete", () => {
  const owner = { id: "owner", name: "Cook", role: "user" };
  const other = { ...owner, id: "other" };
  const admin = { ...other, role: "admin" };
  assert.equal(canEditRecipe(owner, "owner"), true);
  for (const user of [null, other])
    assert.equal(canEditRecipe(user, "owner"), false);
  assert.equal(canEditRecipe(admin, "owner"), true);
  assert.equal(canEditRecipe(admin, null), true);
  assert.equal(canEditRecipe(owner, null), false);
  for (const user of [null, owner, other])
    assert.equal(canDeleteRecipe(user), false);
  assert.equal(canDeleteRecipe(admin), true);
});

test("authentication redirects remain inside the app", () => {
  assert.equal(safeReturnPath("/recipes/new"), "/recipes/new");
  for (const value of [
    undefined,
    null,
    "https://example.com",
    "//example.com",
    "/\\example.com",
  ])
    assert.equal(safeReturnPath(value), "/");
});
