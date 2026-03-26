/**
 * EventSection — renders a single donation event as a table in the PDF.
 *
 * Each row represents one DonationItem within the event. Non-deductible items
 * (poor condition at or below $500 per IRC §170(f)(16)) are rendered with:
 * - opacity: 0.4 (dimmed) to visually signal exclusion
 * - Line Total shows "---" instead of a dollar amount
 * - A note below the item name: "Not deductible — IRC §170(f)(16)"
 *
 * Section header uses wrap={false} + minPresenceAhead={40} to prevent
 * orphaned headers at the bottom of a page — the header will advance
 * to the next page if fewer than 40pt remain. Item rows themselves
 * are allowed to wrap across pages (no wrap={false} on rows).
 */
import { View, Text } from '@react-pdf/renderer'
import { tableStyles, sectionStyles, formatCurrency, formatDate } from './styles'
import { isDeductible } from '../store/selectors'
import type { DonationEvent } from '../store/types'

interface EventSectionProps {
  event: DonationEvent
}

export function EventSection({ event }: EventSectionProps) {
  return (
    <View style={sectionStyles.section}>
      {/*
        wrap={false} on the header only — prevents an orphaned header at the bottom
        of a page with no rows beneath it. minPresenceAhead pushes the header to the
        next page if fewer than 40pt of space remain for rows.
      */}
      <View wrap={false} minPresenceAhead={40}>
        {/* Event organization name */}
        <Text style={sectionStyles.sectionHeader}>{event.organization}</Text>

        {/* Donation date */}
        <Text style={sectionStyles.subHeader}>Donated: {formatDate(event.date)}</Text>

        {/* Table header row */}
        <View style={tableStyles.table}>
          <View style={tableStyles.headerRow}>
            <View style={tableStyles.colName}>
              <Text style={tableStyles.headerCell}>Item</Text>
            </View>
            <View style={tableStyles.colCondition}>
              <Text style={tableStyles.headerCell}>Condition</Text>
            </View>
            <View style={tableStyles.colQty}>
              <Text style={tableStyles.headerCell}>Qty</Text>
            </View>
            <View style={tableStyles.colFmv}>
              <Text style={tableStyles.headerCell}>FMV Each</Text>
            </View>
            <View style={tableStyles.colTotal}>
              <Text style={tableStyles.headerCell}>Line Total</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Item rows — allowed to wrap across pages individually */}
      <View style={tableStyles.table}>
        {event.items.map((item) => {
          const deductible = isDeductible(item)
          const lineTotal = deductible ? item.fmv_selected * item.quantity : null

          return (
            <View
              key={item.id}
              style={deductible ? tableStyles.dataRow : tableStyles.strikeRow}
            >
              {/* Item name + non-deductible note (if applicable) */}
              <View style={tableStyles.colName}>
                <Text style={tableStyles.cellText}>{item.name}</Text>
                {!deductible && (
                  <Text style={tableStyles.nonDeductibleNote}>
                    Not deductible — IRC §170(f)(16)
                  </Text>
                )}
              </View>

              {/* Condition — capitalize for display */}
              <View style={tableStyles.colCondition}>
                <Text style={tableStyles.cellText}>
                  {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
                </Text>
              </View>

              {/* Quantity */}
              <View style={tableStyles.colQty}>
                <Text style={tableStyles.cellText}>{item.quantity}</Text>
              </View>

              {/* FMV per item */}
              <View style={tableStyles.colFmv}>
                <Text style={tableStyles.cellText}>{formatCurrency(item.fmv_selected)}</Text>
              </View>

              {/* Line total — "---" for non-deductible items */}
              <View style={tableStyles.colTotal}>
                <Text style={tableStyles.cellText}>
                  {lineTotal !== null ? formatCurrency(lineTotal) : '---'}
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}
