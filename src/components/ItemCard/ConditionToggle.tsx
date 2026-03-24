/**
 * ConditionToggle — three-segment radio toggle for Poor / Good / Excellent.
 *
 * Why a fieldset/legend: screen readers need a group label for radio button sets.
 * The legend is visually hidden but announced by AT as "Item condition".
 *
 * On selection change we call resolveFMV to get the new range for the condition,
 * then write all four FMV fields + fmv_selected (reset to mid) atomically via
 * updateItem. This keeps the item's stored FMV consistent with its condition.
 */
import { useDonationStore } from '../../store'
import { resolveFMV } from '../../data/fmv'
import type { DonationItem } from '../../store/types'
import type { Condition } from '../../data/fmv'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConditionToggleProps {
  eventId: string
  item: DonationItem
  taxYear: number
}

// ---------------------------------------------------------------------------
// Label config — keeps the render loop DRY
// ---------------------------------------------------------------------------

const CONDITIONS: Array<{ value: Condition; label: string }> = [
  { value: 'poor', label: 'Poor' },
  { value: 'good', label: 'Good' },
  { value: 'excellent', label: 'Excellent' },
]

/**
 * Returns the Tailwind classes for a condition label based on whether it is
 * currently selected. Poor has distinct red treatment per UI-SPEC.
 */
function labelClasses(value: Condition, isSelected: boolean): string {
  const base =
    'flex-1 text-center text-xs font-medium cursor-pointer py-1.5 transition-colors select-none'

  if (!isSelected) return `${base} bg-white text-brand-600 hover:bg-brand-50`

  // Selected state varies by condition — Poor uses red, others use brand
  if (value === 'poor') return `${base} bg-red-100 text-red-700 border-red-300`
  if (value === 'good') return `${base} bg-brand-600 text-white`
  return `${base} bg-brand-500 text-white`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConditionToggle({ eventId, item, taxYear }: ConditionToggleProps) {
  const updateItem = useDonationStore((s) => s.updateItem)

  function handleChange(newCondition: Condition) {
    // Resolve the FMV range for the new condition and reset fmv_selected to mid.
    // Writing all four fields atomically avoids a brief state where condition and
    // FMV range are out of sync.
    const range = resolveFMV(item.catalogSlug, newCondition, taxYear)
    updateItem(eventId, item.id, {
      condition: newCondition,
      fmv_low: range.low,
      fmv_mid: range.mid,
      fmv_high: range.high,
      fmv_selected: range.mid,
    })
  }

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">Item condition</legend>
      {/* role="group" is implicit on fieldset but we add it explicitly for
          maximum AT compatibility across browsers */}
      <div
        className="flex rounded-md border border-brand-200 overflow-hidden"
        role="group"
      >
        {CONDITIONS.map(({ value, label }) => {
          const isSelected = item.condition === value
          return (
            <label
              key={value}
              className={labelClasses(value, isSelected)}
            >
              {/* Hidden radio input — the label IS the visual control */}
              <input
                type="radio"
                name={`condition-${item.id}`}
                value={value}
                checked={isSelected}
                onChange={() => handleChange(value)}
                className="sr-only"
              />
              {label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
