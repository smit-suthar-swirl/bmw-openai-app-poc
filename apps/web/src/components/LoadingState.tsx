export function LoadingDots() {
  return (
    <div className="flex gap-1.5 py-1 px-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full bg-bmw-blue animate-pulse-soft"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bmw-card animate-pulse">
      <div className="h-44 bg-bmw-dark" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="h-5 bg-bmw-border rounded w-32" />
          <div className="h-5 bg-bmw-border rounded w-20" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 bg-bmw-dark rounded-xl" />
          ))}
        </div>
        <div className="h-3 bg-bmw-border rounded w-full" />
        <div className="h-3 bg-bmw-border rounded w-4/5" />
        <div className="h-9 bg-bmw-dark rounded-lg" />
      </div>
    </div>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
      <span className="text-red-400 text-lg flex-shrink-0">⚠</span>
      <div className="flex-1">
        <p className="text-red-400 text-sm">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs text-bmw-blue hover:underline mt-1"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-10 animate-fade-in">
      <div className="w-12 h-12 rounded-full bg-bmw-dark border border-bmw-border flex items-center justify-center mx-auto mb-4">
        <span className="text-xl">🔍</span>
      </div>
      <h3 className="text-bmw-light font-semibold mb-1">{title}</h3>
      <p className="text-bmw-silver text-sm">{description}</p>
    </div>
  );
}
