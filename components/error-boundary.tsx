"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is an extension-related error that should be ignored
    const errorMessage = error.message?.toLowerCase() || ""
    const extensionKeywords = [
      "metamask",
      "ethereum",
      "web3",
      "coinbase",
      "wallet",
      "crypto",
      "blockchain",
      "extension",
      "injected",
      "provider",
      "connect",
      "defineProperty",
    ]

    const isExtensionError = extensionKeywords.some((keyword) => errorMessage.includes(keyword))

    if (isExtensionError) {
      console.log("Extension error ignored in error boundary:", error.message)
      return { hasError: false }
    }

    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Check if this is an extension-related error
    const errorMessage = error.message?.toLowerCase() || ""
    const extensionKeywords = [
      "metamask",
      "ethereum",
      "web3",
      "coinbase",
      "wallet",
      "crypto",
      "blockchain",
      "extension",
      "injected",
      "provider",
      "connect",
      "defineProperty",
    ]

    const isExtensionError = extensionKeywords.some((keyword) => errorMessage.includes(keyword))

    if (isExtensionError) {
      console.log("Extension error caught and ignored:", error.message)
      this.setState({ hasError: false })
      return
    }

    console.error("Application error caught by boundary:", error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  handleRefresh = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-red-900 dark:text-red-100">Something went wrong</CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                We encountered an unexpected error. Don't worry, we're here to help you get back on track.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs">
                  <p className="font-mono text-red-600 dark:text-red-400">{this.state.error.message}</p>
                </div>
              )}
              <div className="flex flex-col space-y-2">
                <Button onClick={this.handleRetry} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleRefresh} variant="outline" className="w-full bg-transparent">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
                <Button onClick={this.handleGoHome} variant="ghost" className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Home
                </Button>
              </div>
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>If the problem persists, please contact our support team.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
