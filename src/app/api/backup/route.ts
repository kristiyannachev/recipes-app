import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  decodeBackup,
  InvalidBackupError,
  MAX_BACKUP_BYTES,
} from "@/lib/backup-format";
import { prisma } from "@/lib/prisma";
import {
  exportRecipes,
  restoreRecipes,
  summarizeBackup,
} from "@/lib/recipe-backup";
import { isTrustedMutation } from "@/lib/request-security";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "admin")
    return NextResponse.json({ errorCode: "error.forbidden" }, { status: 403 });
  try {
    const bytes = await exportRecipes(prisma);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="recipes-backup-${new Date().toISOString().slice(0, 10)}.json.gz"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { errorCode: "error.exportBackup" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isTrustedMutation(request))
    return NextResponse.json({ errorCode: "error.forbidden" }, { status: 403 });
  const user = await getCurrentUser();
  if (user?.role !== "admin")
    return NextResponse.json({ errorCode: "error.forbidden" }, { status: 403 });
  try {
    const contentLength = Number(request.headers.get("content-length"));
    if (contentLength > MAX_BACKUP_BYTES + 1024 * 1024)
      throw new InvalidBackupError();
    const form = await request.formData();
    const file = form.get("file");
    const action = form.get("action");
    if (
      !(file instanceof File) ||
      file.size > MAX_BACKUP_BYTES ||
      (action !== "preview" && action !== "restore")
    )
      throw new InvalidBackupError();
    const backup = await decodeBackup(Buffer.from(await file.arrayBuffer()));
    const summary = await summarizeBackup(prisma, backup);
    if (action === "restore") {
      await restoreRecipes(prisma, backup, user.id);
      revalidatePath("/", "layout");
    }
    return NextResponse.json(summary, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        errorCode:
          error instanceof InvalidBackupError
            ? "error.invalidBackup"
            : "error.restoreBackup",
      },
      { status: error instanceof InvalidBackupError ? 400 : 500 },
    );
  }
}
