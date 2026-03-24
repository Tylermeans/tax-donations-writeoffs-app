/**
 * CategoryBreakdown — per-category deduction totals (DASH-03).
 *
 * Only renders when there is at least one category with a non-zero total.
 * Receives pre-computed totals from the parent (TotalsDashboard) so this
 * component stays pure and free of store subscriptions.
 */

interface CategoryBreakdownProps {
  totalsByCategory: Record<string, number>
}

export function CategoryBreakdown({ totalsByCategory }: CategoryBreakdownProps) {
  const entries = Object.entries(totalsByCategory)

  // Do not render an empty section — parent conditionally mounts based on this
  if (entries.length === 0) return null

  return (
    <div className="mt-5 pt-4 border-t border-brand-100 flex flex-col gap-2">
      <p className="text-xs font-medium text-brand-500 uppercase tracking-wide">By category</p>
      {entries.map(([category, total]) => (
        <div key={category} className="flex justify-between text-sm">
          {/* Capitalize the category slug for human-readable display */}
          <span className="text-brand-600">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </span>
          <span className="text-brand-800 font-medium tabular-nums">${total.toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}
