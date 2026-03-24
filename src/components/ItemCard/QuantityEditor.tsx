/**
 * QuantityEditor — inline +/- stepper with direct number input for item quantity.
 *
 * Why clamp on blur + Enter (not on every keystroke): if we clamp live the user
 * can't type "1" as the first digit of "12" without it being reset to 1. Clamping
 * on commit (blur or Enter) gives a natural typing experience.
 *
 * The decrement button is disabled at quantity=1 to prevent going below 1. The
 * increment button is disabled at quantity=99 per the 1-99 range requirement.
 */
import { useState, useEffect } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useDonationStore } from '../../store'
import type { DonationItem } from '../../store/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuantityEditorProps {
  eventId: string
  item: DonationItem
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Clamps a value to the valid quantity range of 1–99. */
function clamp(value: number): number {
  return Math.min(99, Math.max(1, value))
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuantityEditor({ eventId, item }: QuantityEditorProps) {
  const updateItem = useDonationStore((s) => s.updateItem)

  // Local string state lets the user type freely; we only commit on blur/Enter.
  // This avoids the "type 1 → clamps to 1 before you can type 2" problem.
  const [inputValue, setInputValue] = useState(String(item.quantity))

  // Keep local input in sync when the store quantity changes externally
  // (e.g., after increment/decrement buttons or undo)
  useEffect(() => {
    setInputValue(String(item.quantity))
  }, [item.quantity])

  function commitValue(raw: string) {
    const parsed = parseInt(raw, 10)
    const clamped = isNaN(parsed) ? 1 : clamp(parsed)
    setInputValue(String(clamped))
    if (clamped !== item.quantity) {
      updateItem(eventId, item.id, { quantity: clamped })
    }
  }

  function handleDecrement() {
    updateItem(eventId, item.id, { quantity: Math.max(1, item.quantity - 1) })
  }

  function handleIncrement() {
    updateItem(eventId, item.id, { quantity: Math.min(99, item.quantity + 1) })
  }

  function handleBlur() {
    commitValue(inputValue)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      commitValue(inputValue)
      e.currentTarget.blur()
    }
  }

  // Shared button base classes
  const buttonBase =
    'w-7 h-7 flex items-center justify-center rounded border border-brand-200 bg-white text-brand-600 hover:bg-brand-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors'

  return (
    <div className="flex items-center gap-1" aria-label="Quantity">
      {/* Decrement — disabled at minimum (1) */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={item.quantity <= 1}
        aria-label="Decrease quantity"
        className={buttonBase}
      >
        <Minus size={12} aria-hidden />
      </button>

      {/* Direct number input — commits on blur or Enter */}
      <input
        type="number"
        min={1}
        max={99}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-label="Item quantity"
        className="w-12 h-7 text-center text-sm border border-brand-200 rounded text-brand-800 tabular-nums focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20"
      />

      {/* Increment — disabled at maximum (99) */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={item.quantity >= 99}
        aria-label="Increase quantity"
        className={buttonBase}
      >
        <Plus size={12} aria-hidden />
      </button>
    </div>
  )
}
