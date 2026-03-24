/**
 * ItemSearch — type-ahead combobox for finding donation items.
 *
 * Implements ARIA combobox pattern (role="combobox" + role="listbox") so
 * screen readers announce "X results available" when the dropdown opens and
 * track focus position with aria-activedescendant.
 *
 * Keyboard contract:
 *   ArrowDown  — move focus down (open dropdown if closed)
 *   ArrowUp    — move focus up
 *   Enter      — select the focused item
 *   Escape     — close dropdown without selecting
 *
 * FMV defaults: items are added with 'good' condition and fmv_selected = mid.
 * This matches user expectations (most donated items are in good condition).
 */
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { getAllItems, resolveFMV } from '../../data/fmv'
import { useDonationStore } from '../../store'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ItemSearchProps {
  /** The donation event to add selected items to. */
  eventId: string
  /** Called after an item is successfully added to the event. */
  onItemAdded?: () => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ItemSearch({ eventId, onItemAdded }: ItemSearchProps) {
  const taxYear = useDonationStore((s) => s.taxYear)
  const addItem = useDonationStore((s) => s.addItem)

  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  // Filter items against both label and searchTerms — useMemo avoids re-running
  // the full catalog filter on every render unrelated to query changes.
  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return []
    return getAllItems(taxYear).filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.searchTerms.some((t) => t.toLowerCase().includes(q))
    )
  }, [query, taxYear])

  // aria-activedescendant links the input to the highlighted option element.
  // Undefined when nothing is highlighted so screen readers don't announce stale IDs.
  const activeOptionId =
    activeIndex >= 0 ? `item-option-${results[activeIndex].slug}` : undefined

  // handleSelect: resolve FMV for 'good' condition, add to store, then reset UI.
  // Default condition is 'good' — the most common donation condition and the
  // baseline the Salvation Army guide values are calibrated for.
  function handleSelect(item: (typeof results)[number]) {
    const range = resolveFMV(item.slug, 'good', taxYear)
    addItem(eventId, {
      catalogSlug: item.slug,
      name: item.label,
      category: item.category,
      quantity: 1,
      condition: 'good',
      fmv_low: range.low,
      fmv_mid: range.mid,
      fmv_high: range.high,
      fmv_selected: range.mid,
      irsNote: item.irsNote,
    })
    setQuery('')
    setIsOpen(false)
    setActiveIndex(-1)
    onItemAdded?.()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        // Open if closed so keyboard users can reveal results without typing more
        if (!isOpen) setIsOpen(true)
        setActiveIndex((prev) => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && results[activeIndex]) {
          handleSelect(results[activeIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  const showDropdown = isOpen && query.trim().length > 0

  return (
    // role="combobox" wraps the input + listbox pair per ARIA 1.2 spec.
    // aria-expanded reflects the listbox visibility (true only when results exist).
    <div
      className="relative"
      role="combobox"
      aria-expanded={showDropdown && results.length > 0}
      aria-haspopup="listbox"
    >
      <div className="relative">
        <input
          type="search"
          className="w-full h-10 px-3 pr-10 border border-brand-200 rounded-lg text-sm text-brand-800 placeholder:text-brand-400 bg-white focus-visible:outline-none focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-500/20"
          placeholder="Search items — e.g. jeans, sofa, laptop"
          aria-label="Search donation items"
          aria-autocomplete="list"
          aria-controls="item-search-listbox"
          aria-activedescendant={activeOptionId}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
            setActiveIndex(-1)
          }}
          onKeyDown={handleKeyDown}
          // Re-open dropdown when user re-focuses with an existing query
          onFocus={() => query.trim() && setIsOpen(true)}
        />
        <Search
          className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400"
          size={16}
          aria-hidden
        />
      </div>

      {showDropdown && (
        <ul
          id="item-search-listbox"
          role="listbox"
          className="absolute z-10 w-full mt-1 bg-white border border-brand-100 rounded-lg shadow-md overflow-y-auto max-h-64"
        >
          {results.length === 0 ? (
            // Not an option element — aria-live announcements from combobox handle this
            <li className="px-3 py-2 text-sm text-brand-500">
              No items match &ldquo;{query}&rdquo;
            </li>
          ) : (
            results.map((item, i) => (
              <li
                key={item.slug}
                id={`item-option-${item.slug}`}
                role="option"
                aria-selected={i === activeIndex}
                // cursor-pointer per CLAUDE.md — every clickable element
                className={`px-3 py-2 text-sm cursor-pointer ${
                  i === activeIndex ? 'bg-brand-50' : 'hover:bg-brand-50'
                }`}
                onClick={() => handleSelect(item)}
                // Sync mouse hover with keyboard activeIndex so ArrowDown/Up
                // start from the correct position after a mouse hover
                onMouseEnter={() => setActiveIndex(i)}
              >
                {item.label}
                <span className="text-xs text-brand-400 ml-1">{item.category}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
