/**
 * ReportHeader — top-of-page section for the PDF report.
 *
 * Per D-14: donor personal information is NOT collected in v1.
 * The taxpayer name and ID lines are printed as blank fill-in lines
 * so the user can write them in manually before handing the PDF to their CPA.
 *
 * These are NOT input fields — they are static printed text with underscores.
 */
import { View, Text } from '@react-pdf/renderer'
import { formatDate } from './styles'

interface ReportHeaderProps {
  taxYear: number
  /** ISO timestamp string from ReportData.generatedAt */
  generatedAt: string
}

export function ReportHeader({ taxYear, generatedAt }: ReportHeaderProps) {
  // Format the generation timestamp as a readable date/time
  const generatedDisplay = new Date(generatedAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Document title */}
      <Text
        style={{
          fontFamily: 'Helvetica-Bold',
          fontSize: 14,
          marginBottom: 4,
          color: '#1a1a1a',
        }}
      >
        Donation Summary — Tax Year {taxYear}
      </Text>

      {/* Subtitle */}
      <Text
        style={{
          fontFamily: 'Helvetica',
          fontSize: 10,
          color: '#555555',
          marginBottom: 12,
        }}
      >
        Non-Cash Charitable Contributions
      </Text>

      {/* Donor info — blank lines per D-14 (not collected in v1) */}
      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontFamily: 'Helvetica', fontSize: 10, marginBottom: 6, color: '#1a1a1a' }}>
          Taxpayer Name: _______________________________
        </Text>
        <Text style={{ fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a' }}>
          Taxpayer ID (SSN/EIN): _______________________________
        </Text>
      </View>

      {/* Generation timestamp — right-aligned */}
      <Text
        style={{
          fontFamily: 'Helvetica',
          fontSize: 8,
          color: '#888888',
          textAlign: 'right',
          marginTop: 4,
        }}
      >
        Generated: {generatedDisplay}
      </Text>

      {/* Horizontal rule below header */}
      <View
        style={{
          borderBottomWidth: 2,
          borderBottomColor: '#cccccc',
          marginTop: 8,
        }}
      />
    </View>
  )
}
