export type Uploaded = { url: string; width: number; height: number };

export async function uploadFiles(files: File[]): Promise<Uploaded[]> {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  const res = await fetch("/api/upload", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Upload gagal");
  return json.files as Uploaded[];
}
