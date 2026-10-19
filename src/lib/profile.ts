import { eq } from "drizzle-orm";
import { db, settings } from "@/db";

export type Profile = {
  name: string;
  handle: string;
  headline: string;
  tagline: string;
  heroPhoto: string;
  aboutPhoto: string;
  contactPhoto: string;
  about: string;
  education: { degree: string; school: string; period: string; gpa: string };
  skills: { group: string; items: string; icons: string[] }[];
  services: { icon: string; label: string }[];
  email: string;
  phone: string;
  location: string;
  github: string;
  instagram: string;
  linkedin: string;
};

export const defaultProfile: Profile = {
  name: "Miftahul Huda Amri",
  handle: "miftahulhdd",
  headline: "Web Development & Design Enthusiast",
  tagline: "Mahasiswa Informatika Universitas Andalas, angkatan 2024.",
  heroPhoto: "",
  aboutPhoto: "",
  contactPhoto: "",
  about:
    "Saya Miftahul Huda Amri, biasa dipanggil Huda, mahasiswa Informatika Universitas Andalas angkatan 2024. Saya tertarik pada web development dan desain, terutama memadukan logika dengan estetika untuk membuat pengalaman digital yang fungsional.\n\nSaya terus mengeksplorasi teknologi frontend modern dan prinsip desain yang bersih. Di luar layar, fotografi jadi ruang kreatif saya untuk menangkap cerita dan sudut pandang lewat lensa.",
  education: { degree: "Sarjana Informatika", school: "Universitas Andalas", period: "2024 · Sekarang", gpa: "" },
  skills: [
    { group: "Front-End", items: "HTML, CSS, JavaScript, Bootstrap, Next.js", icons: ["html5", "css", "javascript", "nextdotjs"] },
    { group: "Desain", items: "Adobe Photoshop, Figma, Canva", icons: ["photoshop", "figma", "canva"] },
    { group: "Fotografi", items: "Portrait, Landscape, Event", icons: ["camera"] },
    { group: "Soft skill", items: "Problem solving, Teamwork, Komunikasi", icons: [] },
  ],
  services: [
    { icon: "code", label: "Web Development" },
    { icon: "camera", label: "Photography" },
    { icon: "pen", label: "Graphic Design" },
    { icon: "phone", label: "Flutter Development" },
  ],
  email: "",
  phone: "",
  location: "Padang, Sumatera Barat",
  github: "https://github.com/miftahulhdd",
  instagram: "https://instagram.com/miftahulhdd",
  linkedin: "",
};

export async function getProfile(): Promise<Profile> {
  try {
    const row = await db.query.settings.findFirst({ where: eq(settings.key, "profile") });
    const stored = (row?.value ?? {}) as Record<string, unknown>;
    const merged = { ...defaultProfile, ...stored } as Profile;
    // kompatibilitas dengan data versi lama (pendidikan berupa daftar, keahlian tanpa ikon)
    if (Array.isArray(merged.education) || !merged.education) merged.education = defaultProfile.education;
    merged.skills = (merged.skills ?? []).map((sk) => ({
      ...sk,
      icons: sk.icons ?? defaultProfile.skills.find((d) => d.group === sk.group)?.icons ?? [],
    }));
    return merged;
  } catch {
    return defaultProfile;
  }
}
