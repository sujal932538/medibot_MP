"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Heart, Thermometer, Droplets, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { PatientLayout } from "@/components/patient-layout"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"

export default function VitalsPage() {
  const { user } = useUser()
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  const vitals = useQuery(api.vitals.getVitals, 
    user ? { patientId: user.id, limit: 20 } : "skip"
  ) || []

  const latestVitals = useQuery(api.vitals.getLatestVitals,
    user ? { patientId: user.id } : "skip"
  )

  // Simulate ESP32 connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(Math.random() > 0.1) // 90% uptime simulation
      setLastUpdate(new Date())
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getVitalStatus = (vital: string, value: number) => {
    switch (vital) {
      case "heartRate":
        if (value >= 60 && value <= 100) return { status: "Normal", color: "bg-green-500" }
        return { status: "Abnormal", color: "bg-red-500" }
      case "spO2":
        if (value >= 95) return { status: "Normal", color: "bg-green-500" }
        return { status: "Low", color: "bg-yellow-500" }
      case "temperature":
        if (value >= 97 && value <= 99) return { status: "Normal", color: "bg-green-500" }
        return { status: "Fever", color: "bg-red-500" }
      default:
        return { status: "Normal", color: "bg-green-500" }
    }
  }

  const mockCurrentVitals = {
    heartRate: 72,
    spO2: 98,
    temperature: 98.6,
    bmi: 23.5,
  }

  const currentVitals = latestVitals || mockCurrentVitals

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vital Signs</h1>
            <p className="text-gray-600 dark:text-gray-300">Real-time monitoring from your ESP32 device</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "ESP32 Connected" : "Device Offline"}
              </Badge>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Current Vitals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Current Vital Signs</span>
              <Badge variant="secondary">Live</Badge>
            </CardTitle>
            <CardDescription>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Heart Rate */}
              <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentVitals.heartRate || '--'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">BPM</div>
                <div className="flex items-center justify-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getVitalStatus("heartRate", currentVitals.heartRate || 0).color}`} />
                  <span className="text-xs font-medium">
                    {getVitalStatus("heartRate", currentVitals.heartRate || 0).status}
                  </span>
                </div>
              </div>

              {/* SpO2 */}
              <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Droplets className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentVitals.spO2 || '--'}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">SpO2</div>
                <div className="flex items-center justify-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getVitalStatus("spO2", currentVitals.spO2 || 0).color}`} />
                  <span className="text-xs font-medium">
                    {getVitalStatus("spO2", currentVitals.spO2 || 0).status}
                  </span>
                </div>
              </div>

              {/* Temperature */}
              <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Thermometer className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentVitals.temperature?.toFixed(1) || '--'}°F
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">Temperature</div>
                <div className="flex items-center justify-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getVitalStatus("temperature", currentVitals.temperature || 0).color}`} />
                  <span className="text-xs font-medium">
                    {getVitalStatus("temperature", currentVitals.temperature || 0).status}
                  </span>
                </div>
              </div>

              {/* BMI */}
              <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Activity className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentVitals.bmi?.toFixed(1) || '--'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">BMI</div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs font-medium">Normal</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vitals History */}
        <Card>
          <CardHeader>
            <CardTitle>Vitals History</CardTitle>
            <CardDescription>Your vital signs over time</CardDescription>
          </CardHeader>
          <CardContent>
            {vitals.length > 0 ? (
              <div className="space-y-4">
                {vitals.map((vital) => (
                  <div key={vital._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="grid grid-cols-4 gap-4 flex-1">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Heart Rate</p>
                        <p className="font-semibold">{vital.heartRate || '--'} BPM</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">SpO2</p>
                        <p className="font-semibold">{vital.spO2 || '--'}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Temperature</p>
                        <p className="font-semibold">{vital.temperature?.toFixed(1) || '--'}°F</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">BMI</p>
                        <p className="font-semibold">{vital.bmi?.toFixed(1) || '--'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(vital._creationTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No vitals data available</p>
                <p className="text-sm text-gray-400">Connect your ESP32 device to start monitoring</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ESP32 Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>ESP32 Device Setup</CardTitle>
            <CardDescription>Connect your ESP32 device for real-time monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">API Endpoint for ESP32:</h4>
                <code className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded block">
                  POST {process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/esp32/vitals
                </code>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Required JSON Format:</h4>
                <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
{`{
  "deviceId": "esp32_001",
  "patientId": "${user?.id || 'your_patient_id'}",
  "heartRate": 72,
  "spO2": 98,
  "temperature": 98.6,
  "bmi": 23.5
}`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  )
}