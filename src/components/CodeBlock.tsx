import { highlight } from "@/lib/highlight";
import CopyButton from "./CopyButton";

export default async function CodeBlock({ code, language, filename }: { code: string; language: string; filename?: string }) {
  const html = await highlight(code, language);
  return (
    <div className="code-block my-4 overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line bg-surface-2 px-3 py-1.5">
        <span className="font-mono text-xs text-muted">{filename || language}</span>
        <CopyButton text={code} />
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
