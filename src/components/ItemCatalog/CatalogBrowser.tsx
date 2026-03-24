/**
 * CatalogBrowser — browse donation items by category, then add from the list.
 *
 * Two states:
 *   1. Grid view — shows all categories with icon, name, and item count.
 *      2 columns on mobile, 3 columns on md+. Matches UI-SPEC section 2.
 *   2. Detail view — after selecting a category, shows all items in that
 *      category as clickable rows. A back button returns to the grid.
 *
 * Item selection: same handleSelect logic as ItemSearch — adds with 'good'
 * condition and fmv_selected = mid. Calls onItemAdded() to collapse the picker.
 *
 * capitalize() converts slug keys like "sporting-goods" → "Sporting Goods"
 * for user-facing display without maintaining a separate label map.
 */
import { BookOpen, ChevronLeft, Dumbbell, Home, Laptop, Music, Package, Shirt, Sofa } from 'lucide-react'
import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { getAllItems, getCategories, resolveFMV } from '../../data/fmv'
import { useDonationStore } from '../../store'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CatalogBrowserProps {
  /** The donation event to add selected items to. */
  eventId: string
  /** Called after an item is successfully added to the event. */
  onItemAdded?: () => void
}

// Maps category slugs to Lucide icons — Package is the fallback for unknown categories.
// These 7 icons cover all categories in the 2025 FMV catalog.
const iconMap: Record<string, LucideIcon> = {
  clothing: Shirt,
  'sporting-goods': Dumbbell,
  furniture: Sofa,
  electronics: Laptop,
  household: Home,
  'books-media-toys': BookOpen,
  instruments: Music,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a slug like "sporting-goods" to "Sporting Goods".
 * Replaces hyphens with spaces and capitalizes each word.
 */
function capitalize(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CatalogBrowser({ eventId, onItemAdded }: CatalogBrowserProps) {
  const taxYear = useDonationStore((s) => s.taxYear)
  const addItem = useDonationStore((s) => s.addItem)

  // selectedCategory: null shows the category grid; a string shows the item list
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = getCategories(taxYear)
  const allItems = getAllItems(taxYear)

  // handleSelect: same FMV resolution and addItem call as ItemSearch.
  // Default condition is 'good' — most donations and what guide values are based on.
  function handleSelect(item: (typeof allItems)[number]) {
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
    onItemAdded?.()
  }

  // Category detail view — shown after clicking a category tile
  if (selectedCategory !== null) {
    const categoryItems = allItems.filter((item) => item.category === selectedCategory)

    return (
      <div>
        {/* Back button to return to the category grid */}
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-1 text-sm text-brand-600 hover:text-brand-500 mb-3 cursor-pointer"
          aria-label={`Back to all categories`}
        >
          <ChevronLeft size={16} aria-hidden />
          {capitalize(selectedCategory)}
        </button>

        {/* Item list — each row adds the item on click */}
        <ul className="divide-y divide-brand-100 border border-brand-100 rounded-lg overflow-hidden">
          {categoryItems.map((item) => (
            <li key={item.slug}>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-brand-50 cursor-pointer rounded flex justify-between items-center"
                aria-label={`Add ${item.label}`}
              >
                <span className="text-brand-800">{item.label}</span>
                <span className="text-xs text-accent-600 font-medium">Add</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // Category grid view — default state
  return (
    <nav aria-label="Browse by category" className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {categories.map((cat) => {
        const Icon = iconMap[cat] ?? Package
        // Filter items per category inline — avoids storing derived data in state
        const items = allItems.filter((item) => item.category === cat)

        return (
          <button
            key={cat}
            type="button"
            className="flex flex-col items-start gap-1 p-4 bg-white border border-brand-100 rounded-lg hover:border-brand-300 hover:bg-brand-50 cursor-pointer transition-colors text-left w-full"
            aria-label={`${capitalize(cat)}: ${items.length} items`}
            onClick={() => setSelectedCategory(cat)}
          >
            <Icon aria-hidden size={20} className="text-brand-500" />
            <span className="text-sm font-medium text-brand-800">{capitalize(cat)}</span>
            <span className="text-xs text-brand-500">{items.length} items</span>
          </button>
        )
      })}
    </nav>
  )
}
