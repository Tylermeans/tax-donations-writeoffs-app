/**
 * Tests whether localStorage is available and writable.
 *
 * Returns false in Safari Private mode, when storage quota is exceeded,
 * or when storage is otherwise blocked by browser security policy.
 *
 * Per D-17: a false result triggers a warning banner but NEVER blocks app usage.
 * The app must remain fully functional even when localStorage is unavailable.
 */
export function detectLocalStorage(): boolean {
  try {
    const key = '__donation_itemizer_ls_test__'
    // Use window.localStorage instead of bare localStorage so tests can replace
    // the property on the window object to simulate blocked storage.
    const storage = window.localStorage
    storage.setItem(key, '1')
    const val = storage.getItem(key)
    storage.removeItem(key) // always clean up, even on success
    return val === '1'
  } catch {
    // Covers: QuotaExceededError, SecurityError (Safari Private), DOMException
    return false
  }
}
