import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProfile } from "@/lib/profile";
import { getGallery, getProjects, getPublishedReports, getTimeline } from "@/lib/queries";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Section from "@/components/Section";
import ProjectGrid from "@/components/ProjectGrid";
import Timeline from "@/components/Timeline";
import ReportCard from "@/components/ReportCard";
import GalleryCarousel from "@/components/GalleryCarousel";
import ContactSection from "@/components/ContactSection";
import Reveal from "@/components/Reveal";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

function shuffle<T>(a: T[]) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default async function Home() {
  const [profile, projects, timeline, reports, gallery] = await Promise.all([
    getProfile(), getProjects(), getTimeline(), getPublishedReports(6), getGallery(),
  ]);
  // foto acak dari seluruh galeri; hanya 12 yang dimuat agar ringan
  const carousel = shuffle(gallery).slice(0, 12);

  return (
    <>
      <Navbar handle={profile.handle} />
      <main>
        <Hero p={profile} />
        <About p={profile} />

        <Section id="portfolio" index="02" title="Portofolio & keaktifan" desc="Proyek yang pernah aku kerjakan, serta jejak organisasi dan kepanitiaan.">
          <ProjectGrid projects={projects} />
          {timeline.length > 0 && (
            <Reveal className="mt-16">
              <Timeline items={timeline} />
            </Reveal>
          )}
        </Section>

        <Section id="report" index="03" title="Laporan praktikum" desc="Dokumentasi praktikum per mata kuliah, lengkap dengan langkah, gambar, dan kode.">
          {reports.length === 0 ? (
            <Reveal><p className="card p-8 text-center text-muted">Belum ada laporan yang dipublikasikan.</p></Reveal>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {reports.map((r, i) => <ReportCard key={r.id} r={r} delay={(i % 3) * 80} />)}
              </div>
              <Reveal className="mt-8">
                <Link href="/reports" className="btn btn-ghost">Lihat semua laporan <ArrowRight className="size-4" /></Link>
              </Reveal>
            </>
          )}
        </Section>

        <Section id="gallery" index="04" title="Galeri" desc="Hasil jepretan pribadi — lanskap, acara, dan hal-hal kecil yang menarik perhatian.">
          <Reveal><GalleryCarousel items={carousel} /></Reveal>
          {gallery.length > 0 && (
            <Reveal className="mt-8">
              <Link href="/gallery" className="btn btn-ghost">Lihat semua foto <ArrowRight className="size-4" /></Link>
            </Reveal>
          )}
        </Section>

        <ContactSection p={profile} />
      </main>
      <Footer p={profile} />
    </>
  );
}
