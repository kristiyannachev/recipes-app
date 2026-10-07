// src/app/api/recipes/route.ts

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { type Category, parseRecipeCategories } from "@/constants/categories";
import { prisma } from "@/lib/prisma";
import { isTrustedMutation } from "@/lib/request-security";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(recipes);
}

export async function POST(req: Request) {
  if (!isTrustedMutation(req))
    return NextResponse.json({ errorCode: "error.forbidden" }, { status: 403 });
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { errorCode: "error.signInRequired" },
      { status: 401 },
    );
  try {
    const body = await req.json();
    const {
      title,
      description,
      ingredients,
      steps,
      cookMinutes,
      imageUrl,
      sourceUrl,
      categories = [],
    } = body;

    if (!title || !ingredients || !steps) {
      return NextResponse.json(
        {
          error: "title, ingredients, and steps required",
          errorCode: "error.recipeRequiredFields",
        },
        { status: 400 },
      );
    }

    let selectedCategories: Category[];
    try {
      selectedCategories = parseRecipeCategories(categories);
    } catch {
      return NextResponse.json(
        {
          error: "Categories must be an array of supported category names.",
          errorCode: "error.invalidCategories",
        },
        { status: 400 },
      );
    }

    const recipe = await prisma.recipe.create({
      data: {
        ownerId: user.id,
        title,
        description: description ?? null,
        ingredients,
        steps,
        cookMinutes: cookMinutes ? Number(cookMinutes) : null,
        imageUrl: imageUrl ?? null,
        sourceUrl: sourceUrl || null,
        categories: selectedCategories,
      },
    });

    revalidatePath("/");
    return NextResponse.json(recipe, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error", errorCode: "error.createRecipe" },
      { status: 500 },
    );
  }
}
