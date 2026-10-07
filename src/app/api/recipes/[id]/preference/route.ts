import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isTrustedMutation } from "@/lib/request-security";
import { getCurrentUser } from "@/lib/session";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!isTrustedMutation(request))
    return NextResponse.json({ errorCode: "error.forbidden" }, { status: 403 });
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { errorCode: "error.signInRequired" },
      { status: 401 },
    );
  const { id: recipeId } = await params;
  if (!(await prisma.recipe.findUnique({ where: { id: recipeId } })))
    return NextResponse.json({ errorCode: "error.notFound" }, { status: 404 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { errorCode: "error.preference" },
      { status: 400 },
    );
  }
  if (!body || typeof body !== "object")
    return NextResponse.json(
      { errorCode: "error.preference" },
      { status: 400 },
    );
  const { isFavorite, note } = body as { isFavorite?: unknown; note?: unknown };
  if (
    (isFavorite !== undefined && typeof isFavorite !== "boolean") ||
    (note !== undefined && (typeof note !== "string" || note.length > 5000)) ||
    (isFavorite === undefined && note === undefined)
  ) {
    return NextResponse.json(
      { errorCode: "error.preference" },
      { status: 400 },
    );
  }
  const data = {
    ...(typeof isFavorite === "boolean" ? { isFavorite } : {}),
    ...(typeof note === "string" ? { note } : {}),
  };
  try {
    const saved = await prisma.recipePreference.upsert({
      where: { userId_recipeId: { userId: user.id, recipeId } },
      create: { userId: user.id, recipeId, ...data },
      update: data,
      select: { isFavorite: true, note: true },
    });
    return NextResponse.json(saved);
  } catch {
    return NextResponse.json(
      { errorCode: "error.preference" },
      { status: 500 },
    );
  }
}
