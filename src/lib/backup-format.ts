import { promisify } from "node:util";
import { gunzip, gzip } from "node:zlib";
import { validateImageBytes } from "./upload";

export const MAX_BACKUP_BYTES = 100 * 1024 * 1024;
const MAX_EXPANDED_BYTES = 200 * 1024 * 1024;
const compress = promisify(gzip);
const expand = promisify(gunzip);

export type BackupRecipe = {
  id: string;
  title: string;
  description: string | null;
  ingredients: string;
  steps: string;
  cookMinutes: number | null;
  imageUrl: string | null;
  sourceUrl: string | null;
  categories: string[];
  createdAt: string;
  ownerEmail: string | null;
};

export type RecipeBackup = {
  format: "recipes-app";
  version: 1;
  exportedAt: string;
  recipes: BackupRecipe[];
  photos: { url: string; mimeType: string; base64: string }[];
};

export type BackupSummary = {
  recipes: number;
  photos: number;
  newRecipes: number;
  updatedRecipes: number;
  reassignedRecipes: number;
  externalPhotos: number;
};

export class InvalidBackupError extends Error {}

function invalid(): never {
  throw new InvalidBackupError("Invalid or unsupported recipe backup");
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  return value as Record<string, unknown>;
}

function text(value: unknown, max = 1_000_000): string {
  if (typeof value !== "string" || value.length > max) invalid();
  return value;
}

function nullableText(value: unknown): string | null {
  return value === null ? null : text(value);
}

function date(value: unknown): string {
  const result = text(value, 100);
  if (!Number.isFinite(Date.parse(result))) invalid();
  return result;
}

export function isUploadUrl(value: string): boolean {
  return /^\/uploads\/[a-zA-Z0-9_-]+\.(?:png|jpg|jpeg|webp|gif)$/i.test(value);
}

function imageUrl(value: unknown): string | null {
  if (value === null || value === "") return null;
  const result = text(value, 2000);
  if (isUploadUrl(result)) return result;
  try {
    if (["http:", "https:"].includes(new URL(result).protocol)) return result;
  } catch {}
  return invalid();
}

export function validateBackup(value: unknown): RecipeBackup {
  const input = record(value);
  if (input.format !== "recipes-app" || input.version !== 1) invalid();
  if (!Array.isArray(input.recipes) || input.recipes.length > 10_000) invalid();
  if (!Array.isArray(input.photos) || input.photos.length > 10_000) invalid();
  const ids = new Set<string>();
  const recipes = input.recipes.map((value) => {
    const recipe = record(value);
    const id = text(recipe.id, 200);
    if (!id || ids.has(id)) invalid();
    ids.add(id);
    const title = text(recipe.title);
    if (!title.trim()) invalid();
    if (!Array.isArray(recipe.categories) || recipe.categories.length > 100)
      invalid();
    const cookMinutes = recipe.cookMinutes;
    if (
      cookMinutes !== null &&
      (typeof cookMinutes !== "number" ||
        !Number.isInteger(cookMinutes) ||
        cookMinutes < 0 ||
        cookMinutes > 2_147_483_647)
    )
      invalid();
    return {
      id,
      title,
      description: nullableText(recipe.description),
      ingredients: text(recipe.ingredients),
      steps: text(recipe.steps),
      cookMinutes: cookMinutes as number | null,
      imageUrl: imageUrl(recipe.imageUrl),
      sourceUrl: nullableText(recipe.sourceUrl),
      categories: recipe.categories.map((value) => text(value, 200)),
      createdAt: date(recipe.createdAt),
      ownerEmail:
        recipe.ownerEmail === null ? null : text(recipe.ownerEmail, 320),
    };
  });
  const urls = new Set<string>();
  const referenced = new Set(recipes.map((recipe) => recipe.imageUrl));
  const photos = input.photos.map((value) => {
    const photo = record(value);
    const url = text(photo.url, 2000);
    if (!isUploadUrl(url) || urls.has(url) || !referenced.has(url)) invalid();
    urls.add(url);
    const mimeType = text(photo.mimeType, 100);
    const base64 = text(photo.base64, 7_000_000);
    const bytes = Buffer.from(base64, "base64");
    if (bytes.toString("base64") !== base64) invalid();
    try {
      validateImageBytes(bytes, mimeType);
    } catch {
      invalid();
    }
    return { url, mimeType, base64 };
  });
  for (const recipe of recipes)
    if (
      recipe.imageUrl &&
      isUploadUrl(recipe.imageUrl) &&
      !urls.has(recipe.imageUrl)
    )
      invalid();
  return {
    format: "recipes-app",
    version: 1,
    exportedAt: date(input.exportedAt),
    recipes,
    photos,
  };
}

export async function encodeBackup(backup: RecipeBackup): Promise<Buffer> {
  validateBackup(backup);
  const json = Buffer.from(JSON.stringify(backup));
  if (json.length > MAX_EXPANDED_BYTES) invalid();
  const bytes = await compress(json);
  if (bytes.length > MAX_BACKUP_BYTES) invalid();
  return bytes;
}

export async function decodeBackup(bytes: Buffer): Promise<RecipeBackup> {
  if (!bytes.length || bytes.length > MAX_BACKUP_BYTES) invalid();
  try {
    const json = await expand(bytes, { maxOutputLength: MAX_EXPANDED_BYTES });
    return validateBackup(JSON.parse(json.toString("utf8")));
  } catch {
    return invalid();
  }
}
