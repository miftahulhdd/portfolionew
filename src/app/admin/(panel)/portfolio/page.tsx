import { getProjects, getTimeline } from "@/lib/queries";
import PortfolioManager from "@/components/admin/PortfolioManager";

export const metadata = { title: "Portofolio" };

export default async function AdminPortfolio() {
  const [projects, timeline] = await Promise.all([getProjects(), getTimeline()]);
  return <PortfolioManager projects={projects} timeline={timeline} categories={Array.from(new Set(projects.map((p) => p.category)))} />;
}
