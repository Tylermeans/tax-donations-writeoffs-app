/**
 * EmptyState — 3-step quick-start guide shown when no donation events exist.
 *
 * Per D-18: inviting tone, not a tutorial wall. Each step is a numbered card
 * with an icon and a brief description. Layout is a vertical stack on mobile
 * (375px) and shifts to horizontal (md: row) on wider screens.
 *
 * Cards are informational (not clickable) so cursor-pointer is NOT applied here.
 */
import { Calendar, Search, FileDown } from 'lucide-react'

interface Step {
  number: number
  icon: React.ReactNode
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: 1,
    icon: <Calendar aria-hidden="true" className="text-brand-500" size={24} />,
    title: 'Add a donation date',
    description: 'Record each trip to Goodwill, Salvation Army, or any 501(c)(3) organization.',
  },
  {
    number: 2,
    icon: <Search aria-hidden="true" className="text-brand-500" size={24} />,
    title: 'Search for items you donated',
    description: 'Pick from hundreds of items and let us fill in the fair market value range.',
  },
  {
    number: 3,
    icon: <FileDown aria-hidden="true" className="text-brand-500" size={24} />,
    title: 'Export your summary',
    description: 'Download a formatted write-off summary ready to share with your tax preparer.',
  },
]

export function EmptyState() {
  return (
    <section aria-label="Getting started guide" className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-brand-800 mb-2">
          Track your donations in three steps
        </h2>
        <p className="text-brand-600 text-sm">
          No account needed. Your data stays in your browser.
        </p>
      </div>

      {/* Vertical on mobile, horizontal on md+ */}
      <ol className="flex flex-col md:flex-row gap-4">
        {steps.map((step) => (
          <li
            key={step.number}
            className="flex-1 bg-white border border-brand-100 rounded-lg px-5 py-6 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              {/* Numbered badge */}
              <span
                aria-hidden="true"
                className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-sm font-bold shrink-0"
              >
                {step.number}
              </span>
              {step.icon}
            </div>
            <h3 className="font-semibold text-brand-800">{step.title}</h3>
            <p className="text-sm text-brand-600 leading-relaxed">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
