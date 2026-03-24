// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { detectLocalStorage } from '../detect'

/** A simple localStorage mock that supports method replacement for testing. */
class MockStorage {
  private store: Record<string, string> = {}

  setItem(key: string, value: string): void {
    this.store[key] = value
  }

  getItem(key: string): string | null {
    return Object.prototype.hasOwnProperty.call(this.store, key)
      ? this.store[key]
      : null
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  clear(): void {
    this.store = {}
  }

  get length(): number {
    return Object.keys(this.store).length
  }
}

/**
 * Replaces window.localStorage with a MockStorage instance.
 * Returns the mock so tests can inspect its state.
 */
function installMockStorage(): MockStorage {
  const mock = new MockStorage()
  Object.defineProperty(window, 'localStorage', {
    value: mock,
    writable: true,
    configurable: true,
  })
  return mock
}

describe('detectLocalStorage', () => {
  let originalDescriptor: PropertyDescriptor | undefined

  beforeEach(() => {
    // Capture original descriptor before each test so we can restore it
    originalDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage')
  })

  afterEach(() => {
    // Restore localStorage to its original state
    if (originalDescriptor) {
      Object.defineProperty(window, 'localStorage', originalDescriptor)
    }
  })

  it('returns true when localStorage is available and writable', () => {
    // Install a clean working mock to avoid any jsdom quirks
    installMockStorage()
    expect(detectLocalStorage()).toBe(true)
  })

  it('returns false when localStorage.setItem throws a QuotaExceededError', () => {
    const mock = installMockStorage()
    // Override setItem to simulate quota exceeded
    mock.setItem = () => { throw new Error('QuotaExceededError') }
    expect(detectLocalStorage()).toBe(false)
  })

  it('returns false when localStorage.setItem throws a SecurityError DOMException', () => {
    const mock = installMockStorage()
    // Override setItem to simulate Safari Private mode blocking storage
    mock.setItem = () => {
      throw new DOMException('The operation is insecure.', 'SecurityError')
    }
    expect(detectLocalStorage()).toBe(false)
  })

  it('cleans up the test key after a successful detection (key absent afterward)', () => {
    const mock = installMockStorage()
    detectLocalStorage()
    // The function must call removeItem on success — key should not persist
    expect(mock.getItem('__donation_itemizer_ls_test__')).toBeNull()
  })

  it('test key is absent in storage after a failed detection', () => {
    const mock = installMockStorage()
    // setItem throws — key was never written, so it should be absent
    mock.setItem = () => { throw new Error('QuotaExceededError') }
    detectLocalStorage()
    // Use a fresh mock to check the key was not persisted elsewhere
    expect(mock.getItem('__donation_itemizer_ls_test__')).toBeNull()
  })
})
