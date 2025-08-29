"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { saveVitals } from "@/lib/database"
import {
  Activity,
  Heart,
  Thermometer,
  Droplets,
  Calendar,
  MessageSquare,
  Bot,
  Pill,
  User,
  Bell,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { PatientLayout } from "@/components/patient-layout"
import { ApiTestButton } from "@/components/api-test-button"
import { useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function PatientDashboard() {
  const { user } = useUser()
  const [vitals, setVitals] = useState({
    heartRate: 72,
    spO2: 98,
    temperature: 98.6,
    bmi: 23.5,
  })
  const [error, setError] = useState<string | null>(null)

  const saveVitalsMutation = useMutation(api.vitals.saveVitals)

  // Simulate real-time vital updates with error handling
  useEffect(() => {
    try {
      const interval = setInterval(() => {
        setVitals((prev) => ({
          heartRate: Math.max(50, Math.min(120, prev.heartRate + (Math.random() - 0.5) * 4)),
          spO2: Math.max(90, Math.min(100, prev.spO2 + (Math.random() - 0.5) * 2)),
          temperature: Math.max(96, Math.min(102, prev.temperature + (Math.random() - 0.5) * 0.4)),
          bmi: prev.bmi,
        }))
      }, 3000)

      // Save vitals to database every 30 seconds
      const saveInterval = setInterval(async () => {
        try {
          if (user) {
            await saveVitalsMutation({
              patientId: user.id,
              heartRate: Math.round(vitals.heartRate),
              spO2: Math.round(vitals.spO2),
              temperature: Number(vitals.temperature.toFixed(1)),
              bmi: Number(vitals.bmi.toFixed(1)),
              deviceId: "esp32_demo_001"
            })
          }
        } catch (error) {
          console.error("Error saving vitals:", error)
        }
      }, 30000)
      return () => {
        clearInterval(interval)
        clearInterval(saveInterval)
      }
    } catch (err) {
      setError("Error updating vital signs")
      console.error("Vitals update error:", err)
    }
  }, [vitals])

  const getVitalStatus = (vital: string, value: number) => {
    try {
      switch (vital) {
        case "heartRate":
          if (value >= 60 && value <= 100) return { status: "normal", color: "bg-green-500" }
          return { status: "abnormal", color: "bg-red-500" }
        case "spO2":
          if (value >= 95) return { status: "normal", color: "bg-green-500" }
          return { status: "low", color: "bg-yellow-500" }
        case "temperature":
          if (value >= 97 && value <= 99) return { status: "normal", color: "bg-green-500" }
          return { status: "fever", color: "bg-red-500" }
        default:
          return { status: "normal", color: "bg-green-500" }
      }
    } catch (err) {
      console.error("Error getting vital status:", err)
      return { status: "error", color: "bg-gray-500" }
    }
  }

  if (error) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center h-64">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            </CardContent>
          </Card>
        </div>
      </PatientLayout>
    )
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.firstName || 'Patient'}!</h1>
            <p className="text-gray-600 dark:text-gray-300">Here's your health overview for today</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link href="/patient/chat">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Bot className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold">AI Assistant</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Chat with MEDIBOT</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/patient/appointments">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold">Appointments</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Book & manage</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/patient/pharmacy">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Pill className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold">Pharmacy</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Order medicines</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/patient/profile">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <User className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <h3 className="font-semibold">Profile</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Health records</p>
              </CardContent>
            </Card>
          </Link>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="space-y-2">
                <h3 className="font-semibold">API Test</h3>
                <ApiTestButton />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Vitals Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Live Vital Monitoring</span>
              <Badge variant="secondary" className="ml-2">
                ESP32 Connected
              </Badge>
            </CardTitle>
            <CardDescription>Real-time monitoring from your connected health devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Heart Rate */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(vitals.heartRate)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">BPM</div>
                <div
                  className={`w-3 h-3 rounded-full mx-auto ${getVitalStatus("heartRate", vitals.heartRate).color}`}
                />
                <div className="text-xs text-gray-500 mt-1">{getVitalStatus("heartRate", vitals.heartRate).status}</div>
              </div>

              {/* SpO2 */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Droplets className="h-8 w-8 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(vitals.spO2)}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">SpO2</div>
                <div className={`w-3 h-3 rounded-full mx-auto ${getVitalStatus("spO2", vitals.spO2).color}`} />
                <div className="text-xs text-gray-500 mt-1">{getVitalStatus("spO2", vitals.spO2).status}</div>
              </div>

              {/* Temperature */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Thermometer className="h-8 w-8 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vitals.temperature.toFixed(1)}°F
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Temperature</div>
                <div
                  className={`w-3 h-3 rounded-full mx-auto ${getVitalStatus("temperature", vitals.temperature).color}`}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {getVitalStatus("temperature", vitals.temperature).status}
                </div>
              </div>

              {/* BMI */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{vitals.bmi.toFixed(1)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">BMI</div>
                <div className="w-3 h-3 rounded-full mx-auto bg-green-500" />
                <div className="text-xs text-gray-500 mt-1">Normal</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Upcoming Appointments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest health interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">AI Consultation</p>
                    <p className="text-xs text-gray-500">Discussed headache symptoms - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Vital Check</p>
                    <p className="text-xs text-gray-500">All vitals normal - 4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Medicine Order</p>
                    <p className="text-xs text-gray-500">Ordered Vitamin D - Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled consultations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div>
                    <p className="font-medium">Dr. Sarah Johnson</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">General Consultation</p>
                    <p className="text-xs text-gray-500">Tomorrow, 2:00 PM</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Join
                  </Button>
                </div>
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No other appointments scheduled</p>
                  <Link href="/patient/appointments">
                    <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                      Book Appointment
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PatientLayout>
  )
}