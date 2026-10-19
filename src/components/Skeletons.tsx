const B = ({ className = "" }: { className?: string }) => <div className={`skeleton ${className}`} />;

export function NavSkeleton() {
  return (
    <div className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <B className="h-5 w-28" />
        <div className="hidden gap-3 md:flex">{Array.from({ length: 5 }).map((_, i) => <B key={i} className="h-5 w-16" />)}</div>
        <B className="h-8 w-[3.75rem] !rounded-full" />
      </div>
    </div>
  );
}

export function CardGridSkeleton({ n = 6, ratio = "aspect-[16/9]" }: { n?: number; ratio?: string }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <B className={`${ratio} !rounded-none`} />
          <div className="space-y-3 p-5"><B className="h-4 w-20" /><B className="h-5 w-4/5" /><B className="h-4 w-full" /></div>
        </div>
      ))}
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <>
      <NavSkeleton />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 md:grid-cols-[1.25fr_1fr] md:pt-24" aria-busy="true" aria-label="Memuat">
        <div className="order-2 space-y-5 md:order-1">
          <B className="h-4 w-24" /><B className="h-16 w-3/4 md:h-20" /><B className="h-7 w-2/3" /><B className="h-5 w-full max-w-md" />
          <div className="flex gap-3 pt-2"><B className="h-11 w-44 !rounded-xl" /><B className="h-11 w-36 !rounded-xl" /></div>
        </div>
        <B className="order-1 mx-auto aspect-[4/5] w-full max-w-[19rem] !rounded-[2rem] md:order-2" />
      </div>
      <div className="mx-auto max-w-6xl px-5 py-10"><B className="mb-4 h-4 w-24" /><B className="mb-10 h-10 w-72" /><CardGridSkeleton n={3} /></div>
    </>
  );
}

export function ListPageSkeleton() {
  return (
    <>
      <NavSkeleton />
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-20" aria-busy="true" aria-label="Memuat">
        <B className="mb-8 h-4 w-20" /><B className="mb-3 h-4 w-16" /><B className="mb-4 h-12 w-80 max-w-full" /><B className="mb-10 h-5 w-96 max-w-full" />
        <CardGridSkeleton />
      </div>
    </>
  );
}

export function ArticleSkeleton() {
  return (
    <>
      <NavSkeleton />
      <div className="mx-auto max-w-3xl px-5 py-12 md:py-16" aria-busy="true" aria-label="Memuat">
        <B className="mb-8 h-4 w-28" />
        <div className="mb-4 flex gap-3"><B className="h-6 w-28 !rounded-full" /><B className="h-6 w-24" /></div>
        <B className="mb-3 h-10 w-full" /><B className="mb-10 h-10 w-2/3" />
        <div className="space-y-3">{[0, 1, 2, 3].map((i) => <B key={i} className="h-4" />)}</div>
        <B className="mb-4 mt-12 h-7 w-48" />
        <B className="h-40 w-full !rounded-xl" />
      </div>
    </>
  );
}

export function GallerySkeleton() {
  const heights = [180, 260, 210, 300, 190, 240];
  return (
    <>
      <NavSkeleton />
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-20" aria-busy="true" aria-label="Memuat">
        <B className="mb-8 h-4 w-20" /><B className="mb-10 h-12 w-64" />
        <div className="columns-2 gap-3 md:columns-3 md:gap-4">
          {heights.map((h, i) => <div key={i} style={{ height: h }} className="mb-3 break-inside-avoid md:mb-4"><div className="skeleton size-full !rounded-xl" /></div>)}
        </div>
      </div>
    </>
  );
}

export function AdminSkeleton() {
  return (
    <div aria-busy="true" aria-label="Memuat">
      <B className="mb-8 h-8 w-48" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <B key={i} className="h-32 !rounded-2xl" />)}</div>
      <B className="mb-3 mt-10 h-5 w-32" />
      <div className="card divide-y divide-line">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="flex gap-3 p-4"><B className="h-10 flex-1" /><B className="h-10 w-16" /></div>)}</div>
    </div>
  );
}
