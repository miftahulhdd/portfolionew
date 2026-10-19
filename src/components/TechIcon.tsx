import {
  IconBrandAdobePhotoshop, IconBrandBootstrap, IconBrandCpp, IconBrandCss3, IconBrandDocker, IconBrandFigma,
  IconBrandFirebase, IconBrandFlutter, IconBrandGit, IconBrandGithub, IconBrandHtml5, IconBrandJavascript,
  IconBrandLaravel, IconBrandMongodb, IconBrandMysql, IconBrandNextjs, IconBrandNodejs, IconBrandPhp,
  IconBrandPrisma, IconBrandPython, IconBrandReact, IconBrandSupabase, IconBrandTailwind, IconBrandTypescript,
  IconBrandVercel, IconBrandVite, IconBrandVue, IconCamera, IconCoffee, IconDatabase, IconPalette, IconServer,
  IconTerminal2, IconCode, type Icon,
} from "@tabler/icons-react";
import { TECH_KEYS } from "@/lib/tech-keys";

// Semua ikon bergaya OUTLINE (garis) dari satu set yang sama agar konsisten, tidak ada yang solid.
const ICONS: Record<string, Icon> = {
  html5: IconBrandHtml5, css: IconBrandCss3, javascript: IconBrandJavascript, typescript: IconBrandTypescript,
  react: IconBrandReact, nextdotjs: IconBrandNextjs, tailwindcss: IconBrandTailwind, bootstrap: IconBrandBootstrap,
  vite: IconBrandVite, vuedotjs: IconBrandVue, nodedotjs: IconBrandNodejs, express: IconServer,
  php: IconBrandPhp, laravel: IconBrandLaravel, python: IconBrandPython, c: IconCode, cplusplus: IconBrandCpp,
  java: IconCoffee, dart: IconBrandFlutter, flutter: IconBrandFlutter,
  mysql: IconBrandMysql, postgresql: IconDatabase, sqlite: IconDatabase, mongodb: IconBrandMongodb,
  firebase: IconBrandFirebase, supabase: IconBrandSupabase, prisma: IconBrandPrisma,
  git: IconBrandGit, github: IconBrandGithub, docker: IconBrandDocker, linux: IconTerminal2, vercel: IconBrandVercel,
  figma: IconBrandFigma, photoshop: IconBrandAdobePhotoshop, canva: IconPalette, camera: IconCamera,
};

/** Ikon outline satu warna (mengikuti warna teks) agar senada dengan tema situs. */
export default function TechIcon({ name, className = "size-5" }: { name: string; className?: string }) {
  const I = ICONS[name];
  if (!I) return null;
  const label = TECH_KEYS.find(([k]) => k === name)?.[1] ?? name;
  return <I className={className} stroke={1.5} aria-label={label} role="img" />;
}
