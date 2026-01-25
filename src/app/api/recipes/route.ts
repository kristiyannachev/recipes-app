// src/app/api/recipes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const recipes = await prisma.recipe.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(recipes);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, ingredients, steps, cookMinutes, imageUrl, category } = body;

    if (!title || !ingredients || !steps) {
      return NextResponse.json({ error: 'title, ingredients, and steps required' }, { status: 400 });
    }

    const recipe = await prisma.recipe.create({
      data: {
        title,
        description: description ?? null,
        ingredients,
        steps,
        cookMinutes: cookMinutes ? Number(cookMinutes) : null,
        imageUrl: imageUrl ?? null,
        category: category ?? null,
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
