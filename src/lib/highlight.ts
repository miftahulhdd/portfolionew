import "server-only";
import { createHighlighter, type Highlighter } from "shiki";

export const LANGUAGES = [
  "plaintext", "bash", "php", "html", "css", "javascript", "typescript", "tsx", "json",
  "sql", "dart", "python", "java", "c", "cpp", "yaml", "blade", "markdown", "xml",
] as const;

let hl: Promise<Highlighter> | null = null;
const getHl = () =>
  (hl ??= createHighlighter({
    themes: ["github-light", "github-dark"],
    langs: LANGUAGES.filter((l) => l !== "plaintext") as unknown as string[],
  }));

export async function highlight(code: string, lang: string) {
  const h = await getHl();
  const language = LANGUAGES.includes(lang as never) && lang !== "plaintext" ? lang : "text";
  return h.codeToHtml(code, {
    lang: language,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
}
