"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Heart, Thermometer, Droplets, Activity, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

interface VitalData {
  heartRate?: number
  spO2?: number
  temperature?: number
  bmi?: number
  timestamp: Date
  deviceId?: string
}

interface VitalAlert {
  type: "heartRate" | "spO2" | "temperature" | "bmi"
  severity: "low" | "medium" | "high"
  message: string
  value: number
  normalRange: { min: number; max: number }
}

export function VitalMonitoringDashboard() {
  const { user } = useUser()
  const [currentVitals, setCurrentVitals] = useState<VitalData>({
    heartRate: 72,
    spO2: 98,
    temperature: 98.6,
    bmi: 23.5,
    timestamp: new Date(),
  })
  const [deviceStatus, setDeviceStatus] = useState<"connected" | "disconnected" | "connecting">("connecting")
  const [alerts, setAlerts] = useState<VitalAlert[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  
  const saveVitalsMutation = useMutation(api.vitals.saveVitals)
  const vitalsQuery = useQuery(api.vitals.getPatientVitals, { 
    patientId: user?.id || "", 
    limit: 50,
    days: 7 
  })

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    if (!user?.id) return

    const connectWebSocket = () => {
      try {
        // Replace with your ESP32 WebSocket endpoint
        const wsUrl = process.env.NEXT_PUBLIC_ESP32_WS_URL || `ws://localhost:8080/ws/${user.id}`
        wsRef.current = new WebSocket(wsUrl)

        wsRef.current.onopen = () => {
          console.log("WebSocket connected to ESP32")
          setDeviceStatus("connected")
        }

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            if (data.type === "vitals") {
              handleVitalUpdate(data.vitals)
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error)
          }
        }

        wsRef.current.onclose = () => {
          console.log("WebSocket disconnected from ESP32")
          setDeviceStatus("disconnected")
          // Attempt to reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000)
        }

        wsRef.current.onerror = (error) => {
          console.error("WebSocket error:", error)
          setDeviceStatus("disconnected")
        }
      } catch (error) {
        console.error("Error connecting to WebSocket:", error)
        setDeviceStatus("disconnected")
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [user?.id])

  // Handle vital updates from ESP32
  const handleVitalUpdate = (vitalData: any) => {
    const newVitals: VitalData = {
      heartRate: vitalData.heartRate,
      spO2: vitalData.spO2,
      temperature: vitalData.temperature,
      bmi: vitalData.bmi,
      timestamp: new Date(),
      deviceId: vitalData.deviceId,
    }

    setCurrentVitals(newVitals)
    setLastUpdate(new Date())

    // Check for alerts
    checkVitalAlerts(newVitals)

    // Save to database
    if (user?.id) {
      saveVitalsMutation({
        patientId: user.id,
        heartRate: newVitals.heartRate,
        spO2: newVitals.spO2,
        temperature: newVitals.temperature,
        bmi: newVitals.bmi,
        deviceId: newVitals.deviceId,
      }).catch(console.error)
    }
  }

  // Check for abnormal vital values and create alerts
  const checkVitalAlerts = (vitals: VitalData) => {
    const newAlerts: VitalAlert[] = []

    // Heart rate alerts (normal: 60-100 bpm)
    if (vitals.heartRate !== undefined) {
      if (vitals.heartRate < 60 || vitals.heartRate > 100) {
        const severity = vitals.heartRate < 50 || vitals.heartRate > 110 ? "high" : 
                        vitals.heartRate < 55 || vitals.heartRate > 105 ? "medium" : "low"
        
        newAlerts.push({
          type: "heartRate",
          severity,
          message: `Abnormal heart rate: ${vitals.heartRate} BPM`,
          value: vitals.heartRate,
          normalRange: { min: 60, max: 100 },
        })
      }
    }

    // SpO2 alerts (normal: 95-100%)
    if (vitals.spO2 !== undefined) {
      if (vitals.spO2 < 95) {
        const severity = vitals.spO2 < 90 ? "high" : 
                        vitals.spO2 < 92 ? "medium" : "low"
        
        newAlerts.push({
          type: "spO2",
          severity,
          message: `Low oxygen saturation: ${vitals.spO2}%`,
          value: vitals.spO2,
          normalRange: { min: 95, max: 100 },
        })
      }
    }

    // Temperature alerts (normal: 97-99°F)
    if (vitals.temperature !== undefined) {
      if (vitals.temperature < 97 || vitals.temperature > 99) {
        const severity = vitals.temperature < 95 || vitals.temperature > 101 ? "high" : 
                        vitals.temperature < 96 || vitals.temperature > 100 ? "medium" : "low"
        
        newAlerts.push({
          type: "temperature",
          severity,
          message: `Abnormal temperature: ${vitals.temperature}°F`,
          value: vitals.temperature,
          normalRange: { min: 97, max: 99 },
        })
      }
    }

    // BMI alerts (normal: 18.5-24.9)
    if (vitals.bmi !== undefined) {
      if (vitals.bmi < 18.5 || vitals.bmi > 24.9) {
        const severity = vitals.bmi < 16 || vitals.bmi > 30 ? "high" : 
                        vitals.bmi < 17 || vitals.bmi > 28 ? "medium" : "low"
        
        newAlerts.push({
          type: "bmi",
          severity,
          message: `Abnormal BMI: ${vitals.bmi}`,
          value: vitals.bmi,
          normalRange: { min: 18.5, max: 24.9 },
        })
      }
    }

    setAlerts(newAlerts)
  }

  // Get vital status and color
  const getVitalStatus = (vital: string, value: number) => {
    switch (vital) {
      case "heartRate":
        if (value >= 60 && value <= 100) return { status: "normal", color: "bg-green-500" }
        return { status: "abnormal", color: "bg-red-500" }
      case "spO2":
        if (value >= 95) return { status: "normal", color: "bg-green-500" }
        return { status: "low", color: "bg-yellow-500" }
      case "temperature":
        if (value >= 97 && value <= 99) return { status: "normal", color: "bg-green-500" }
        return { status: "abnormal", color: "bg-red-500" }
      case "bmi":
        if (value >= 18.5 && value <= 24.9) return { status: "normal", color: "bg-green-500" }
        return { status: "abnormal", color: "bg-yellow-500" }
      default:
        return { status: "normal", color: "bg-green-500" }
    }
  }

  // Manual refresh from ESP32
  const refreshVitals = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/esp32/vitals?patientId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.vitals) {
          handleVitalUpdate(data.vitals)
        }
      }
    } catch (error) {
      console.error("Error refreshing vitals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Get alert severity color
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500"
      case "medium": return "bg-yellow-500"
      case "low": return "bg-orange-500"
      default: return "bg-gray-500"
    }
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Please log in to view your vital signs</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with device status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vital Signs Monitor</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Real-time monitoring from your ESP32 device
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {deviceStatus === "connected" ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : deviceStatus === "connecting" ? (
              <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <span className={`text-sm ${
              deviceStatus === "connected" ? "text-green-600" :
              deviceStatus === "connecting" ? "text-yellow-600" : "text-red-600"
            }`}>
              {deviceStatus === "connected" ? "Connected" :
               deviceStatus === "connecting" ? "Connecting..." : "Disconnected"}
            </span>
          </div>
          <Button 
            onClick={refreshVitals} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Current Vitals Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Heart Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentVitals.heartRate || "--"}
                </div>
                <div className="text-sm text-gray-500">BPM</div>
              </div>
            </div>
            <div className="mt-2">
              <Badge 
                variant="secondary" 
                className={getVitalStatus("heartRate", currentVitals.heartRate || 0).color + " text-white"}
              >
                {getVitalStatus("heartRate", currentVitals.heartRate || 0).status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Oxygen Saturation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Droplets className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentVitals.spO2 || "--"}
                </div>
                <div className="text-sm text-gray-500">%</div>
              </div>
            </div>
            <div className="mt-2">
              <Badge 
                variant="secondary" 
                className={getVitalStatus("spO2", currentVitals.spO2 || 0).color + " text-white"}
              >
                {getVitalStatus("spO2", currentVitals.spO2 || 0).status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Temperature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Thermometer className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentVitals.temperature || "--"}
                </div>
                <div className="text-sm text-gray-500">°F</div>
              </div>
            </div>
            <div className="mt-2">
              <Badge 
                variant="secondary" 
                className={getVitalStatus("temperature", currentVitals.temperature || 0).color + " text-white"}
              >
                {getVitalStatus("temperature", currentVitals.temperature || 0).status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              BMI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentVitals.bmi || "--"}
                </div>
                <div className="text-sm text-gray-500">kg/m²</div>
              </div>
            </div>
            <div className="mt-2">
              <Badge 
                variant="secondary" 
                className={getVitalStatus("bmi", currentVitals.bmi || 0).color + " text-white"}
              >
                {getVitalStatus("bmi", currentVitals.bmi || 0).status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="h-5 w-5" />
              <span>Vital Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getAlertColor(alert.severity)}`} />
                    <div>
                      <p className="font-medium text-red-800 dark:text-red-200">{alert.message}</p>
                      <p className="text-sm text-red-600 dark:text-red-300">
                        Normal range: {alert.normalRange.min} - {alert.normalRange.max}
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive" className="capitalize">
                    {alert.severity} priority
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Data */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Data</CardTitle>
          <CardDescription>
            Your vital signs over the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chart" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chart">Chart View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>
            <TabsContent value="chart" className="mt-4">
              <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500">Chart visualization coming soon...</p>
              </div>
            </TabsContent>
            <TabsContent value="table" className="mt-4">
              <div className="space-y-2">
                {vitalsQuery?.slice(0, 10).map((vital, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {new Date(vital._creationTime).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(vital._creationTime).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6">
                      <span className="text-sm">HR: {vital.heartRate || "--"}</span>
                      <span className="text-sm">SpO2: {vital.spO2 || "--"}%</span>
                      <span className="text-sm">Temp: {vital.temperature || "--"}°F</span>
                      <span className="text-sm">BMI: {vital.bmi || "--"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Last Update Info */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {lastUpdate.toLocaleString()}
      </div>
    </div>
  )
}
