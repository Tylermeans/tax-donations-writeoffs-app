/**
 * FMVRangePicker — range slider for selecting a specific FMV within the item's
 * low/high bounds, with live labels and source attribution.
 *
 * Why onChange (not onMouseUp): live update on every drag tick keeps the line
 * total in the ItemCard responsive during interaction. Per UI-SPEC section 4.
 *
 * The slider thumb uses Tailwind's arbitrary-property variant to style the
 * native WebKit slider thumb without a custom CSS file.
 */
import { useDonationStore } from '../../store'
import type { DonationItem } from '../../store/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FMVRangePickerProps {
  eventId: string
  item: DonationItem
  /** Tax year for the source attribution line (e.g. "Salvation Army 2025 valuation guide") */
  taxYear: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FMVRangePicker({ eventId, item, taxYear }: FMVRangePickerProps) {
  const updateItem = useDonationStore((s) => s.updateItem)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Update fmv_selected on every input event — not just onMouseUp — so the
    // line total updates live while the user drags the slider.
    updateItem(eventId, item.id, { fmv_selected: Number(e.target.value) })
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Range endpoints and current selection */}
      <div className="flex justify-between text-xs">
        <span className="text-brand-500">${item.fmv_low} low</span>
        <span className="font-medium text-brand-700 tabular-nums">
          ${item.fmv_selected} selected
        </span>
        <span className="text-brand-500">${item.fmv_high} high</span>
      </div>

      {/* Native range input — styled to match the brand color scheme */}
      <input
        type="range"
        min={item.fmv_low}
        max={item.fmv_high}
        step={1}
        value={item.fmv_selected}
        onChange={handleChange}
        aria-label={`FMV per item — drag to adjust between $${item.fmv_low} and $${item.fmv_high}`}
        aria-valuetext={`$${item.fmv_selected} per item`}
        className={[
          'w-full h-1.5 bg-brand-100 rounded-full appearance-none cursor-pointer',
          // WebKit thumb styling via Tailwind arbitrary variants
          '[&::-webkit-slider-thumb]:appearance-none',
          '[&::-webkit-slider-thumb]:w-4',
          '[&::-webkit-slider-thumb]:h-4',
          '[&::-webkit-slider-thumb]:bg-brand-600',
          '[&::-webkit-slider-thumb]:rounded-full',
          '[&::-webkit-slider-thumb]:cursor-pointer',
          // Firefox thumb
          '[&::-moz-range-thumb]:w-4',
          '[&::-moz-range-thumb]:h-4',
          '[&::-moz-range-thumb]:bg-brand-600',
          '[&::-moz-range-thumb]:rounded-full',
          '[&::-moz-range-thumb]:border-0',
          '[&::-moz-range-thumb]:cursor-pointer',
          // Focus ring — keyboard accessible
          'focus-visible:outline-none',
          'focus-visible:ring-2',
          'focus-visible:ring-brand-500',
        ].join(' ')}
      />

      {/* Source attribution — required to be transparent about data provenance */}
      <p className="text-xs text-brand-400">
        Charity guide estimate · Salvation Army {taxYear} valuation guide
      </p>
    </div>
  )
}
