import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { isAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Masuk Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm">
        <p className="mb-2 font-mono text-sm font-semibold">admin<span className="text-brand">_</span></p>
        <h1 className="mb-6 text-2xl font-semibold">Masuk ke dashboard</h1>
        <LoginForm />
      </div>
    </main>
  );
}
