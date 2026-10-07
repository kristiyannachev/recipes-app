import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export async function saveRecipeImage(file: File) {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const extension = extensions[file.type];
  if (!extension || file.size > 5 * 1024 * 1024 || file.size === 0)
    throw new Error("Invalid image");
  const bytes = Buffer.from(await file.arrayBuffer());
  const valid =
    file.type === "image/png"
      ? bytes
          .subarray(0, 8)
          .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : file.type === "image/jpeg"
        ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        : file.type === "image/gif"
          ? ["GIF87a", "GIF89a"].includes(bytes.subarray(0, 6).toString())
          : bytes.subarray(0, 4).toString() === "RIFF" &&
            bytes.subarray(8, 12).toString() === "WEBP";
  if (!valid) throw new Error("Invalid image");
  const dir = join(process.cwd(), "public/uploads");
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  await writeFile(join(dir, filename), bytes);
  return `/uploads/${filename}`;
}
