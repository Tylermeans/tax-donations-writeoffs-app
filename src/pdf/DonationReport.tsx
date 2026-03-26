/**
 * DonationReport — root PDF Document component.
 *
 * Receives a ReportData snapshot and renders the complete donation PDF.
 * This file and all sub-components are the only files that import
 * @react-pdf/renderer — never import it in screen components or App.tsx.
 *
 * Page layout (LETTER size, 8.5" × 11"):
 *   1. ReportHeader    — title, tax year, blank donor lines (D-14)
 *   2. EventSection    — one table per donation event
 *   3. TotalsSection   — category breakdown + grand total
 *   4. IRSNoticeSection — Form 8283 callouts + legal disclaimer
 *   5. Fixed footer    — disclaimer + page number on every page
 */
import { Document, Page, View, Text } from '@react-pdf/renderer'
import { ReportHeader } from './ReportHeader'
import { EventSection } from './EventSection'
import { TotalsSection } from './TotalsSection'
import { IRSNoticeSection } from './IRSNoticeSection'
import { pageStyles, footerStyles } from './styles'
import type { ReportData } from './buildReportData'

interface DonationReportProps {
  data: ReportData
}

export function DonationReport({ data }: DonationReportProps) {
  return (
    <Document title={`Donation Summary ${data.taxYear}`}>
      <Page size="LETTER" style={pageStyles.page}>
        {/* 1. Header */}
        <ReportHeader taxYear={data.taxYear} generatedAt={data.generatedAt} />

        {/* 2. One EventSection per donation event */}
        {data.events.map((event) => (
          <EventSection key={event.id} event={event} />
        ))}

        {/* 3. Deduction totals summary */}
        <TotalsSection
          grandTotal={data.grandTotal}
          totalsByCategory={data.totalsByCategory}
        />

        {/* 4. IRS filing notes + legal disclaimer box */}
        <IRSNoticeSection thresholds={data.thresholds} />

        {/* 5. Fixed footer — repeats on every page */}
        <View style={footerStyles.footer} fixed>
          <Text>
            Donation Itemizer — estimates only, not IRS-authorized values. Consult a tax professional.
          </Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
