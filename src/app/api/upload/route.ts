import { NextResponse } from "next/server";
import { isTrustedMutation } from "@/lib/request-security";
import { getCurrentUser } from "@/lib/session";
import { saveRecipeImage } from "@/lib/upload";

export async function POST(request: Request) {
  if (!isTrustedMutation(request))
    return NextResponse.json({ errorCode: "error.forbidden" }, { status: 403 });
  if (!(await getCurrentUser()))
    return NextResponse.json(
      { errorCode: "error.signInRequired" },
      { status: 401 },
    );
  const data = await request.formData();
  const file = data.get("file");
  if (!(file instanceof File))
    return NextResponse.json(
      { errorCode: "error.imageRequired" },
      { status: 400 },
    );
  try {
    const url = await saveRecipeImage(file);
    return NextResponse.json({ success: true, url });
  } catch {
    return NextResponse.json(
      { errorCode: "error.uploadImage" },
      { status: 400 },
    );
  }
}
