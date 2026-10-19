import Reveal from "./Reveal";

export default function Section({ id, index, title, desc, children, className = "" }: { id: string; index: string; title: string; desc?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-5 py-20 md:py-28 ${className}`}>
      <Reveal>
        <header className="mb-10 max-w-2xl md:mb-14">
          <p className="eyebrow mb-3">{index} — {id}</p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">{title}</h2>
          {desc && <p className="mt-4 text-lg text-muted">{desc}</p>}
        </header>
      </Reveal>
      {children}
    </section>
  );
}
