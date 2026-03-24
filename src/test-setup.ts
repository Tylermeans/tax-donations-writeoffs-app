/**
 * Global test setup file.
 *
 * Installs a fully-functional in-memory localStorage mock before any tests run.
 * This is required because happy-dom and some jsdom configurations do not
 * expose a fully-functional Storage object, causing persist middleware to fail.
 *
 * The same MockStorage pattern is used in detect.test.ts (established in Plan 01-01).
 */

class MockStorage implements Storage {
  private store: Record<string, string> = {}

  get length(): number {
    return Object.keys(this.store).length
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null
  }

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key)
      ? (this.store[key] as string)
      : null
  }

  setItem(key: string, value: string): void {
    this.store[key] = value
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  clear(): void {
    this.store = {}
  }
}

// Install before module imports so the persist middleware captures the mock
Object.defineProperty(window, 'localStorage', {
  value: new MockStorage(),
  writable: true,
  configurable: true,
})

Object.defineProperty(window, 'sessionStorage', {
  value: new MockStorage(),
  writable: true,
  configurable: true,
})
