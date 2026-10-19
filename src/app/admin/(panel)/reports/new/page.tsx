import { getAllReports } from "@/lib/queries";
import ReportEditor from "@/components/admin/ReportEditor";

export const metadata = { title: "Laporan baru" };

export default async function NewReport() {
  const courses = Array.from(new Set((await getAllReports()).map((r) => r.course)));
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Laporan baru</h1>
      <ReportEditor
        courses={courses}
        initial={{
          title: "", course: "", number: null, summary: "", intro: "", objective: "", conclusion: "", coverUrl: null, status: "draft",
          steps: [{ title: "", body: "", images: [], codes: [] }], exercises: [],
        }}
      />
    </>
  );
}
