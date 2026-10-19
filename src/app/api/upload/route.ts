import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { saveImage } from "@/lib/storage";
import { MAX_UPLOAD_MB } from "@/lib/images";

export const runtime = "nodejs";

const MAX_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export async function POST(req: Request) {
  // CSRF: hanya terima dari halaman situs ini sendiri
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "Tidak ada file" }, { status: 400 });

  const results = [];
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: `${file.name} bukan gambar` }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `${file.name} lebih dari ${MAX_UPLOAD_MB} MB` }, { status: 400 });
    }
    try {
      results.push(await saveImage(file));
    } catch {
      return NextResponse.json({ error: `Gagal memproses ${file.name}` }, { status: 400 });
    }
  }
  return NextResponse.json({ files: results });
}
