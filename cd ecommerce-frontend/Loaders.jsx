export function ProductSkeleton() {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
      <div className="aspect-square shimmer" />
      <div className="p-4 space-y-3">
        <div className="shimmer h-3 w-16 rounded" />
        <div className="shimmer h-4 w-full rounded" />
        <div className="shimmer h-4 w-3/4 rounded" />
        <div className="flex justify-between items-center">
          <div className="shimmer h-6 w-20 rounded" />
          <div className="shimmer h-9 w-9 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse"
          style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)' }}>
          <span className="text-white text-xl">S</span>
        </div>
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm">Loading...</p>
      </div>
    </div>
  )
}

export default function Loader() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center animate-pulse"
          style={{ background: 'linear-gradient(135deg,#ff5722,#e91e63)' }}>
          <span className="text-white text-lg">•</span>
        </div>
        <p style={{ color: 'var(--text-secondary)' }} className="text-sm font-medium">Loading...</p>
      </div>
    </div>
  )
}