import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { type NextRequest, NextResponse } from "next/server";
import { join } from "path";

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get("file") as unknown as File;

  if (!file) {
    return NextResponse.json(
      {
        success: false,
        error: "No file found",
        errorCode: "error.imageRequired",
      },
      { status: 400 },
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), "public/uploads");

  try {
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
  } catch (error) {
    console.error("Error creating upload directory:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create upload directory",
        errorCode: "error.uploadImage",
      },
      { status: 500 },
    );
  }

  const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
  const path = join(uploadDir, filename);

  try {
    await writeFile(path, buffer);
  } catch (error) {
    console.error("Error saving uploaded image:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Image upload failed",
        errorCode: "error.uploadImage",
      },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true, url: `/uploads/${filename}` });
}
