import { writeFile, mkdir } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json(
      { success: false, error: 'No file found' },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = join(process.cwd(), 'public/uploads');

  try {
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating upload directory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create upload directory' },
      { status: 500 }
    );
  }

  const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const path = join(uploadDir, filename);

  await writeFile(path, buffer);
  return NextResponse.json({ success: true, url: `/uploads/${filename}` });
}
