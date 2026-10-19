import { Fragment } from "react";
import { paragraphs } from "@/lib/utils";

const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|https?:\/\/[^\s<]+)/g;
const safe = (href: string) => /^(https?:\/\/|mailto:)/i.test(href);
const linkCls = "text-brand underline decoration-brand/40 underline-offset-2 transition hover:decoration-brand break-words";

function Link({ href, children }: { href: string; children: React.ReactNode }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={linkCls}>{children}</a>;
}

/**
 * Teks biasa dengan format ringan:
 * paragraf dipisah baris kosong · `kode` · **tebal** · [teks link](https://…) · URL polos otomatis jadi link · daftar dengan awalan "- ".
 */
function inline(text: string) {
  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return <code key={i}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>;
    const md = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (md) return safe(md[2]) ? <Link key={i} href={md[2]}>{md[1]}</Link> : <Fragment key={i}>{md[1]}</Fragment>;
    if (/^https?:\/\//i.test(part)) {
      const m = part.match(/^(.*?)([.,;:!?)]*)$/)!; // titik/koma di ujung bukan bagian URL
      return <Fragment key={i}><Link href={m[1]}>{m[1]}</Link>{m[2]}</Fragment>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export default function RichText({ text }: { text: string }) {
  return (
    <>
      {paragraphs(text).map((p, i) => {
        const lines = p.split("\n");
        if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
          return <ul key={i} className="mb-4 list-disc space-y-1 pl-5 leading-relaxed">{lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*[-*]\s+/, ""))}</li>)}</ul>;
        }
        return <p key={i}>{lines.map((l, j) => <Fragment key={j}>{j > 0 && <br />}{inline(l)}</Fragment>)}</p>;
      })}
    </>
  );
}
