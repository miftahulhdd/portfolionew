// Daftar ikon yang bisa dipilih di admin (tanpa data SVG, aman dipakai di client).
export const TECH_KEYS = [
  ["html5", "HTML"], ["css", "CSS"], ["javascript", "JavaScript"], ["typescript", "TypeScript"],
  ["react", "React"], ["nextdotjs", "Next.js"], ["tailwindcss", "Tailwind CSS"], ["bootstrap", "Bootstrap"],
  ["vite", "Vite"], ["vuedotjs", "Vue"], ["nodedotjs", "Node.js"], ["express", "Express"],
  ["php", "PHP"], ["laravel", "Laravel"], ["python", "Python"], ["c", "C"], ["cplusplus", "C++"],
  ["java", "Java"], ["dart", "Dart"], ["flutter", "Flutter"],
  ["mysql", "MySQL"], ["postgresql", "PostgreSQL"], ["sqlite", "SQLite"], ["mongodb", "MongoDB"],
  ["firebase", "Firebase"], ["supabase", "Supabase"], ["prisma", "Prisma"],
  ["git", "Git"], ["github", "GitHub"], ["docker", "Docker"], ["linux", "Linux"], ["vercel", "Vercel"],
  ["figma", "Figma"], ["photoshop", "Photoshop"], ["canva", "Canva"], ["camera", "Kamera"],
] as const;
export type TechKey = (typeof TECH_KEYS)[number][0];
export const MAX_SKILL_ICONS = 4;
