"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TestTube, CheckCircle, XCircle, Loader2 } from "lucide-react"

export function ApiTestButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)

  const testGeminiAPI = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/test-gemini")
      const data = await response.json()
      setTestResults(data)
    } catch (error) {
      setTestResults({ error: "Failed to test API" })
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-4">
      <Button onClick={testGeminiAPI} disabled={isLoading} variant="outline">
        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TestTube className="h-4 w-4 mr-2" />}
        Test Gemini API
      </Button>

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>API Test Results</CardTitle>
            <CardDescription>API Key: {testResults.apiKey}</CardDescription>
          </CardHeader>
          <CardContent>
            {testResults.error ? (
              <div className="text-red-600">Error: {testResults.error}</div>
            ) : (
              <div className="space-y-3">
                {testResults.results?.map((result: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{result.endpoint}</div>
                      <div className="text-sm text-gray-500">Status: {result.status}</div>
                      {result.error && <div className="text-sm text-red-600">Error: {result.error}</div>}
                    </div>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                      {result.success ? "Working" : "Failed"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
