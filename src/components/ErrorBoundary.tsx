/**
 * ErrorBoundary — catches React rendering errors and shows a recovery UI
 * instead of a white screen. Logs the error to console for debugging.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error)
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-warm-50 px-4">
          <div className="bg-white border border-red-200 rounded-xl p-8 max-w-lg w-full">
            <h1 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h1>
            <p className="text-sm text-brand-600 mb-4">
              The app hit an unexpected error. Your donation data is safe in localStorage.
            </p>
            <details className="mb-4">
              <summary className="text-sm text-brand-500 cursor-pointer">Error details</summary>
              <pre className="mt-2 text-xs bg-brand-50 p-3 rounded overflow-auto max-h-40 text-red-600">
                {this.state.error?.message}
                {'\n'}
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null })
              }}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
