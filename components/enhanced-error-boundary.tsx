'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Bug, Copy } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  enableReporting?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate a unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('EnhancedErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Report error to monitoring service (if enabled)
    if (this.props.enableReporting) {
      this.reportError(error, errorInfo)
    }

    // Show toast notification
    toast.error('An unexpected error occurred', {
      description: 'The application encountered an error and will attempt to recover.',
      action: {
        label: 'Retry',
        onClick: () => this.handleRetry()
      }
    })
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // In a real application, you would send this to your error reporting service
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: null, // Would be populated from auth context
        retryCount: this.retryCount
      }

      // Example: Send to error reporting service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // })

      console.log('Error report generated:', errorReport)
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null
      })
      
      toast.success('Retrying...', {
        description: `Attempt ${this.retryCount} of ${this.maxRetries}`
      })
    } else {
      toast.error('Maximum retries reached', {
        description: 'Please refresh the page or contact support.'
      })
    }
  }

  private handleRefresh = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleCopyError = () => {
    if (this.state.error && this.state.errorInfo) {
      const errorText = `Error ID: ${this.state.errorId}
Error: ${this.state.error.message}
Stack: ${this.state.error.stack}
Component Stack: ${this.state.errorInfo.componentStack}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}`

      navigator.clipboard.writeText(errorText).then(() => {
        toast.success('Error details copied to clipboard')
      }).catch(() => {
        toast.error('Failed to copy error details')
      })
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
          <Card className="w-full max-w-2xl shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-lg">
                We encountered an unexpected error. Don't worry, we're working on it!
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error ID for support */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Error ID
                    </p>
                    <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      {this.state.errorId}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={this.handleCopyError}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Details
                  </Button>
                </div>
              </div>

              {/* Error details (if enabled) */}
              {this.props.showDetails && this.state.error && (
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">
                    Technical Details
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        Error Message:
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-400 font-mono bg-red-100 dark:bg-red-900/20 p-2 rounded">
                        {this.state.error.message}
                      </p>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-300">
                          Stack Trace:
                        </p>
                        <pre className="text-xs text-red-600 dark:text-red-400 font-mono bg-red-100 dark:bg-red-900/20 p-2 rounded overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleRetry}
                  disabled={this.retryCount >= this.maxRetries}
                  className="flex items-center gap-2 flex-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  {this.retryCount >= this.maxRetries ? 'Max Retries Reached' : `Retry (${this.retryCount}/${this.maxRetries})`}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={this.handleRefresh}
                  className="flex items-center gap-2 flex-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Page
                </Button>
                
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2 flex-1"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {/* Help text */}
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>
                  If this problem persists, please{' '}
                  <a 
                    href="mailto:support@agentdash.com" 
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    contact support
                  </a>
                  {' '}with the error ID above.
                </p>
              </div>

              {/* Recovery suggestions */}
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Troubleshooting Tips
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Try refreshing the page</li>
                  <li>• Clear your browser cache and cookies</li>
                  <li>• Disable browser extensions temporarily</li>
                  <li>• Check your internet connection</li>
                  <li>• Try using a different browser</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for using error boundary in functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    console.error('Error captured by useErrorHandler:', error)
    setError(error)
    
    // Show toast notification
    toast.error('An error occurred', {
      description: error.message,
      action: {
        label: 'Dismiss',
        onClick: () => resetError()
      }
    })
  }, [resetError])

  // Throw error to be caught by error boundary
  if (error) {
    throw error
  }

  return { captureError, resetError }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: T) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default EnhancedErrorBoundary
