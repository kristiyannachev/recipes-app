import { readFile, stat, unlink } from "node:fs/promises";
import { basename, join } from "node:path";
import type { PrismaClient } from "@prisma/client";
import {
  type BackupSummary,
  encodeBackup,
  isUploadUrl,
  type RecipeBackup,
} from "./backup-format";
import { getUploadDirectory, saveRecipeImage } from "./upload";

const mimeTypes: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

export async function exportRecipes(db: PrismaClient): Promise<Buffer> {
  const recipes = await db.recipe.findMany({
    orderBy: { id: "asc" },
    take: 10_001,
    include: { owner: { select: { email: true } } },
  });
  if (recipes.length > 10_000) throw new Error("Too many recipes");
  let totalPhotoBytes = 0;
  const photos: RecipeBackup["photos"] = [];
  const urls = new Set(
    recipes
      .map((recipe) => recipe.imageUrl)
      .filter((url): url is string => !!url && isUploadUrl(url)),
  );
  for (const url of urls) {
    const filename = basename(url);
    // Only validated upload paths are read; missing photos fail the export.
    const photoPath = join(getUploadDirectory(), filename);
    const metadata = await stat(photoPath);
    totalPhotoBytes += metadata.size;
    if (metadata.size > 5 * 1024 * 1024 || totalPhotoBytes > 100 * 1024 * 1024)
      throw new Error("Photo size limit exceeded");
    const bytes = await readFile(photoPath);
    photos.push({
      url,
      mimeType: mimeTypes[filename.split(".").pop()?.toLowerCase() ?? ""],
      base64: bytes.toString("base64"),
    });
  }
  return encodeBackup({
    format: "recipes-app",
    version: 1,
    exportedAt: new Date().toISOString(),
    recipes: recipes.map(
      ({ owner, ownerId: _ownerId, createdAt, categories, ...recipe }) => ({
        ...recipe,
        categories: Array.isArray(categories) ? (categories as string[]) : [],
        createdAt: createdAt.toISOString(),
        ownerEmail: owner?.email ?? null,
      }),
    ),
    photos,
  });
}

async function resolveOwners(db: PrismaClient, backup: RecipeBackup) {
  const emails = [
    ...new Set(
      backup.recipes
        .map((recipe) => recipe.ownerEmail)
        .filter((email): email is string => !!email),
    ),
  ];
  const users = await db.user.findMany({
    where: { email: { in: emails } },
    select: { id: true, email: true },
  });
  return new Map(users.map((user) => [user.email, user.id]));
}

export async function summarizeBackup(
  db: PrismaClient,
  backup: RecipeBackup,
): Promise<BackupSummary> {
  const [existing, owners] = await Promise.all([
    db.recipe.count({
      where: { id: { in: backup.recipes.map((recipe) => recipe.id) } },
    }),
    resolveOwners(db, backup),
  ]);
  return {
    recipes: backup.recipes.length,
    photos: backup.photos.length,
    newRecipes: backup.recipes.length - existing,
    updatedRecipes: existing,
    reassignedRecipes: backup.recipes.filter(
      (recipe) => !recipe.ownerEmail || !owners.has(recipe.ownerEmail),
    ).length,
    externalPhotos: backup.recipes.filter(
      (recipe) => recipe.imageUrl && !isUploadUrl(recipe.imageUrl),
    ).length,
  };
}

export async function restoreRecipes(
  db: PrismaClient,
  backup: RecipeBackup,
  adminId: string,
) {
  const owners = await resolveOwners(db, backup);
  const images = new Map<string, string>();
  try {
    for (const photo of backup.photos) {
      const file = new File(
        [new Uint8Array(Buffer.from(photo.base64, "base64"))],
        "photo",
        { type: photo.mimeType },
      );
      images.set(photo.url, await saveRecipeImage(file));
    }
    // Update all recipe rows together, retaining existing favorites and notes.
    await db.$transaction(
      async (tx) => {
        for (const recipe of backup.recipes) {
          const { ownerEmail, ...fields } = recipe;
          const data = {
            ...fields,
            createdAt: new Date(recipe.createdAt),
            imageUrl: recipe.imageUrl
              ? (images.get(recipe.imageUrl) ?? recipe.imageUrl)
              : null,
            ownerId: (ownerEmail && owners.get(ownerEmail)) || adminId,
          };
          await tx.recipe.upsert({
            where: { id: recipe.id },
            create: data,
            update: data,
          });
        }
      },
      { timeout: 60_000 },
    );
  } catch (error) {
    // Fresh filenames prevent overwrites; remove only this failed restore's files.
    await Promise.allSettled(
      [...images.values()].map((url) =>
        unlink(join(getUploadDirectory(), basename(url))),
      ),
    );
    throw error;
  }
}
