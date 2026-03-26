/**
 * IRSNoticeSection — IRS filing notes and legal disclaimer box.
 *
 * Shows Form 8283 callouts based on threshold flags computed upstream:
 * - requiresForm8283SectionA: aggregate total > $500
 * - requiresQualifiedAppraisal: any single item > $5,000
 *
 * The legal disclaimer is always shown regardless of thresholds (EXPO-04).
 * It uses Helvetica-Oblique to visually distinguish it from operational content.
 */
import { View, Text } from '@react-pdf/renderer'
import { noticeBoxStyles } from './styles'

interface IRSNoticeSectionProps {
  thresholds: {
    requiresForm8283SectionA: boolean
    requiresQualifiedAppraisal: boolean
    highValueItemName?: string
  }
}

export function IRSNoticeSection({ thresholds }: IRSNoticeSectionProps) {
  const { requiresForm8283SectionA, requiresQualifiedAppraisal, highValueItemName } = thresholds

  return (
    <View style={noticeBoxStyles.box}>
      <Text style={noticeBoxStyles.title}>IRS Filing Notes</Text>

      {/* Form 8283 Section A callout — triggered when total > $500 */}
      {requiresForm8283SectionA && (
        <Text style={noticeBoxStyles.bullet}>
          {'• '}
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Form 8283, Section A required:</Text>
          {' Your total non-cash donations exceed $500. Attach Form 8283 (Section A) to your federal return. '
            + 'Complete columns (a) through (i): (a) organization name, (b) address, (c) description, '
            + '(d) date acquired by donor, (e) date donated, (f) how acquired, (g) donor\'s cost basis, '
            + '(h) FMV, (i) method of determining FMV. '
            + 'FMV method: Thrift store value — Salvation Army Valuation Guide 2025.'}
        </Text>
      )}

      {/* Qualified appraisal callout — triggered when any single item > $5,000 */}
      {requiresQualifiedAppraisal && (
        <Text style={noticeBoxStyles.bullet}>
          {'• '}
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Qualified appraisal required:</Text>
          {` "${highValueItemName ?? 'An item'}" has an FMV exceeding $5,000. `
            + 'Form 8283 Section B is required, and you must obtain a qualified appraisal from '
            + 'a certified appraiser before filing. The appraiser must sign the form.'}
        </Text>
      )}

      {/* No additional forms required — mention $250 per-event acknowledgment */}
      {!requiresForm8283SectionA && !requiresQualifiedAppraisal && (
        <Text style={noticeBoxStyles.bullet}>
          {'• No additional IRS forms are required at this donation level. '}
          If any single donation event totals more than $250, request a written acknowledgment
          {' from each recipient organization. Keep it with your records (IRS Publication 1771).'}
        </Text>
      )}

      {/* $250 written acknowledgment reminder — always relevant regardless of other thresholds */}
      {(requiresForm8283SectionA || requiresQualifiedAppraisal) && (
        <Text style={noticeBoxStyles.bullet}>
          {'• '}
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>Written acknowledgment:</Text>
          {' For any single donation event exceeding $250, obtain a written acknowledgment '
            + 'from the recipient organization (IRS Publication 1771). Keep it with your records.'}
        </Text>
      )}

      {/* Legal disclaimer — always shown (EXPO-04) */}
      <Text style={noticeBoxStyles.disclaimer}>
        DISCLAIMER: This report provides estimates based on Salvation Army and Goodwill valuation guides (2025).
        These are not IRS-authorized values. Fair market value is determined by what a buyer would pay for the
        item in its current condition. Consult a qualified tax professional before filing.
        Donation Itemizer is not responsible for the accuracy of your deductions.
      </Text>
    </View>
  )
}
