import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getStats } from "@/lib/queries";
import AdminNav from "@/components/admin/Nav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const { unread } = await getStats();
  return (
    <div className="min-h-screen">
      <AdminNav unread={unread} />
      <main className="mx-auto max-w-4xl px-5 py-8 md:ml-60 md:max-w-none md:px-10 md:py-10">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
