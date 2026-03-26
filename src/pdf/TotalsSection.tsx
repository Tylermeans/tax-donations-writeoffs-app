/**
 * TotalsSection — deduction summary with per-category breakdown and grand total.
 *
 * Only deductible items are included in these figures — poor-condition items
 * at or below $500 are excluded by the selectors upstream (not re-filtered here).
 * This component trusts the pre-computed grandTotal and totalsByCategory values
 * passed via props from buildReportData.
 */
import { View, Text } from '@react-pdf/renderer'
import { sectionStyles, formatCurrency } from './styles'

interface TotalsSectionProps {
  grandTotal: number
  totalsByCategory: Record<string, number>
}

export function TotalsSection({ grandTotal, totalsByCategory }: TotalsSectionProps) {
  const categories = Object.entries(totalsByCategory)

  return (
    <View style={sectionStyles.section}>
      <Text style={sectionStyles.sectionHeader}>Deduction Summary</Text>

      {/* Per-category rows */}
      {categories.length > 0 ? (
        categories.map(([category, total]) => (
          <View
            key={category}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: 3,
              paddingBottom: 3,
              borderBottomWidth: 1,
              borderBottomColor: '#eeeeee',
            }}
          >
            {/* Capitalize category name for display */}
            <Text style={{ fontFamily: 'Helvetica', fontSize: 10, color: '#333333' }}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
            <Text style={{ fontFamily: 'Helvetica', fontSize: 10, color: '#333333' }}>
              {formatCurrency(total)}
            </Text>
          </View>
        ))
      ) : (
        <Text style={{ fontFamily: 'Helvetica', fontSize: 9, color: '#888888', marginBottom: 4 }}>
          No deductible items recorded.
        </Text>
      )}

      {/* Grand total row — bold with top border for emphasis */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingTop: 6,
          marginTop: 4,
          borderTopWidth: 2,
          borderTopColor: '#333333',
        }}
      >
        <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#1a1a1a' }}>
          Grand Total
        </Text>
        <Text style={{ fontFamily: 'Helvetica-Bold', fontSize: 11, color: '#1a1a1a' }}>
          {formatCurrency(grandTotal)}
        </Text>
      </View>
    </View>
  )
}
