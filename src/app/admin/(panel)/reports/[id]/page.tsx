import { notFound } from "next/navigation";
import { getAllReports, getReportById } from "@/lib/queries";
import ReportEditor from "@/components/admin/ReportEditor";

export const metadata = { title: "Edit laporan" };

export default async function EditReport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, all] = await Promise.all([getReportById(id), getAllReports()]);
  if (!data) notFound();
  const { report: r, steps } = data;
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Edit laporan</h1>
      <ReportEditor
        courses={Array.from(new Set(all.map((x) => x.course)))}
        initial={{
          id: r.id, slug: r.slug, title: r.title, course: r.course, number: r.number, summary: r.summary, intro: r.intro,
          objective: r.objective, conclusion: r.conclusion, coverUrl: r.coverUrl, status: r.status,
          steps: steps.filter((s) => s.kind !== "exercise").map((s) => ({ title: s.title, body: s.body, images: s.images, codes: s.codes })),
          exercises: steps.filter((s) => s.kind === "exercise").map((s) => ({ title: s.title, body: s.body, images: s.images, codes: s.codes })),
        }}
      />
    </>
  );
}
