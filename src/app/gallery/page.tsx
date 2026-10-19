import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getProfile } from "@/lib/profile";
import { getGallery } from "@/lib/queries";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GalleryGrid from "@/components/GalleryGrid";
import Reveal from "@/components/Reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Galeri" };

export default async function GalleryPage() {
  const [profile, items] = await Promise.all([getProfile(), getGallery()]);
  return (
    <>
      <Navbar handle={profile.handle} />
      <main className="mx-auto min-h-[70vh] max-w-6xl px-5 py-12 md:py-20">
        <Link href="/#gallery" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"><ArrowLeft className="size-4" /> Kembali</Link>
        <Reveal>
          <p className="eyebrow mb-3">Gallery</p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Galeri foto</h1>
          <p className="mb-10 mt-4 max-w-xl text-lg text-muted">Semua hasil jepretanku. Klik foto untuk melihat ukuran penuh.</p>
        </Reveal>
        <GalleryGrid items={items} />
      </main>
      <Footer p={profile} />
    </>
  );
}
