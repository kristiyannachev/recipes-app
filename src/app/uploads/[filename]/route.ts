import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getUploadDirectory } from "@/lib/upload";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const match = filename.match(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|gif)$/i,
  );
  if (!match) return new Response(null, { status: 404 });
  const contentTypes: Record<string, string> = {
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  try {
    const bytes = await readFile(join(getUploadDirectory(), filename));
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": contentTypes[match[1].toLowerCase()],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return new Response(null, { status: 404 });
    throw error;
  }
}
