export function GridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="curator-card p-5 animate-pulse">
          <div className="aspect-square bg-surface-container rounded mb-3" />
          <div className="h-3 bg-surface-container rounded w-1/3 mb-2" />
          <div className="h-4 bg-surface-container rounded w-3/4 mb-2" />
          <div className="h-3 bg-surface-container rounded w-full" />
        </div>
      ))}
    </div>
  );
}

export function ListPageSkeleton({ sectionLabel }: { sectionLabel?: string }) {
  return (
    <div className="curator-section max-w-[1600px] mx-auto">
      <div className="mb-8">
        {sectionLabel && (
          <div className="label-caps text-outline block mb-2 tracking-[0.3em] animate-pulse">
            <div className="h-3 bg-surface-container rounded w-24" />
          </div>
        )}
        <div className="h-10 bg-surface-container rounded w-64 animate-pulse mb-3" />
        <div className="h-4 bg-surface-container rounded w-96 animate-pulse" />
      </div>
      <div className="h-12 bg-surface-container-low rounded-sm mb-6 animate-pulse" />
      <div className="flex flex-wrap gap-2 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-24 bg-surface-container-low rounded-full animate-pulse" />
        ))}
      </div>
      <GridSkeleton />
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="curator-section max-w-[1200px] mx-auto">
      <div className="h-4 bg-surface-container rounded w-48 mb-8 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="aspect-square bg-surface-container-low rounded-sm animate-pulse" />
        <div className="space-y-4">
          <div className="h-3 bg-surface-container rounded w-24 animate-pulse" />
          <div className="h-10 bg-surface-container rounded w-full animate-pulse" />
          <div className="h-10 bg-surface-container rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-surface-container rounded w-full animate-pulse" />
          <div className="h-4 bg-surface-container rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-surface-container rounded w-4/6 animate-pulse" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-surface-container-low rounded-sm animate-pulse" />
        ))}
      </div>
    </div>
  );
}
