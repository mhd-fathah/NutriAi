export function Loader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} border-2 border-emerald-200 border-t-emerald-500 rounded-full animate-spin`}
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-3 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gray-200" />
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
      <div className="space-y-2">
        <div className="h-7 bg-gray-200 rounded w-16" />
        <div className="h-3 bg-gray-100 rounded w-24" />
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full mt-4" />
    </div>
  );
}
