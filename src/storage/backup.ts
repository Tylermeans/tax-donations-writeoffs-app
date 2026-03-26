/**
 * JSON backup export and import utilities.
 *
 * exportJSON: downloads a formatted .json file containing the user's donation
 * data. Triggered by ExportJSONButton. Includes an exportedAt timestamp so
 * users can identify which backup is most recent when comparing files.
 *
 * importJSON: reads a user-selected .json file, validates it against
 * PersistedStateSchema, and calls a success/error callback. The caller
 * (ImportBackupButton) is responsible for hydrating the store — this function
 * only handles I/O and validation.
 *
 * Why a separate module: keeps the blob/FileReader browser API calls isolated
 * from React component code, making both independently testable.
 */
import { PersistedStateSchema } from './schema'
import type { ValidatedPersistedState } from './schema'
import type { PersistedState } from '../store/types'

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

/**
 * Downloads the user's donation data as a pretty-printed JSON file.
 *
 * Filename includes the tax year so users can easily identify backups when
 * managing multiple files across tax years.
 *
 * Implementation notes:
 * - Anchor is appended to document.body before click to work in Firefox.
 *   Firefox requires the anchor to be in the DOM to trigger the download.
 * - URL.revokeObjectURL is called immediately after click to prevent memory
 *   leaks — the browser has already queued the download by that point.
 */
export function exportJSON(state: PersistedState): void {
  // Build the backup payload — exportedAt lets users identify the newest backup
  const payload = {
    exportedAt: new Date().toISOString(),
    schemaVersion: state.schemaVersion,
    taxYear: state.taxYear,
    events: state.events,
  }

  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `donation-itemizer-backup-${state.taxYear}.json`

  // Append to body for Firefox compatibility (Firefox requires anchor in DOM)
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)

  // Revoke immediately — browser has already queued the download
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

/**
 * Reads a user-selected .json file, validates it against PersistedStateSchema,
 * and calls the appropriate callback.
 *
 * Two failure modes, each with a distinct user-facing message:
 * 1. JSON parse failure — file is not valid JSON at all (corrupted, wrong format)
 * 2. Schema validation failure — valid JSON but wrong shape (different app,
 *    wrong version, or user-edited fields that broke the structure)
 *
 * Using callbacks instead of a Promise to stay consistent with the FileReader
 * event-based API pattern already used in the codebase.
 */
export function importJSON(
  file: File,
  onSuccess: (state: ValidatedPersistedState) => void,
  onError: (message: string) => void
): void {
  const reader = new FileReader()

  reader.onload = (event) => {
    const text = event.target?.result

    // Guard: FileReader should always produce a string for readAsText, but
    // the type is string | ArrayBuffer | null so we check explicitly
    if (typeof text !== 'string') {
      onError('Could not read the backup file. Make sure it is a valid JSON file.')
      return
    }

    let raw: unknown

    // Failure mode 1: file is not valid JSON
    try {
      raw = JSON.parse(text)
    } catch {
      onError('Could not read the backup file. Make sure it is a valid JSON file.')
      return
    }

    // Failure mode 2: valid JSON but wrong shape / version
    const result = PersistedStateSchema.safeParse(raw)
    if (!result.success) {
      onError('This backup file is not compatible with the current app version.')
      return
    }

    onSuccess(result.data)
  }

  reader.onerror = () => {
    onError('Could not read the backup file. Make sure it is a valid JSON file.')
  }

  reader.readAsText(file)
}
