"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Phone,
  Video,
  AlertTriangle,
  Stethoscope,
} from "lucide-react"
import { DoctorLayout } from "@/components/doctor-layout"
import { useToast } from "@/hooks/use-toast"
import { AppointmentList } from "./components/appointment-list"

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientName: "Ronak W",
      patientEmail: "patient@example.com",
      symptoms: "Persistent headache and fatigue for 3 days. Pain level 6/10, affecting daily activities.",
      severity: "medium",
      requestedTime: "2024-01-22 14:00:00",
      status: "pending",
      aiAnalysis:
        "Patient reports moderate headache with fatigue. Symptoms suggest possible tension headache or mild migraine. Recommend consultation for proper diagnosis.",
      vitalSigns: { heartRate: 75, spO2: 98, temperature: 98.4 },
    },
    {
      id: 2,
      patientName: "Ronak W",
      patientEmail: "patient@example.com",
      symptoms: "Chest pain and shortness of breath during exercise. Started yesterday evening.",
      severity: "high",
      requestedTime: "2024-01-22 10:30:00",
      status: "approved",
      aiAnalysis:
        "HIGH PRIORITY: Chest pain with dyspnea requires immediate evaluation. Possible cardiac or pulmonary etiology. Urgent consultation recommended.",
      vitalSigns: { heartRate: 95, spO2: 94, temperature: 99.1 },
    },
    {
      id: 3,
      patientName: "Ronak W",
      patientEmail: "patient@example.com",
      symptoms: "My 5-year-old has fever (101°F) and persistent cough for 2 days. Not eating well.",
      severity: "medium",
      requestedTime: "2024-01-23 16:00:00",
      status: "pending",
      aiAnalysis:
        "Pediatric case: Fever with cough in young child. Possible viral or bacterial infection. Requires pediatric evaluation for proper treatment.",
      vitalSigns: { heartRate: 110, spO2: 97, temperature: 101.0 },
    },
  ])

  const { toast } = useToast()

  const handleAppointmentAction = (appointmentId: number, action: "approve" | "reject") => {
    const appointment = appointments.find(apt => apt.id === appointmentId)
    if (!appointment) return

    // Update local state
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId ? { ...apt, status: action === "approve" ? "approved" : "rejected" } : apt,
      ),
    )

    // Send API request to update appointment and trigger email
    fetch(`/api/appointments/${appointmentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: action === "approve" ? "approved" : "rejected",
        doctorNotes: action === "reject" ? "Doctor is not available at the requested time" : "Appointment confirmed",
        meetingLink: action === "approve" ? `https://medibot-meet.com/room/${appointmentId}` : null
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log("Appointment updated and email sent successfully")
      } else {
        console.error("Failed to update appointment:", data.error)
      }
    })
    .catch(error => {
      console.error("Error updating appointment:", error)
    })

    toast({
      title: action === "approve" ? "Appointment Approved" : "Appointment Rejected",
      description: `Patient notified via email in real-time! ${action === "approve" ? "Confirmation" : "Rejection"} email sent instantly.`,
    })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 border-red-200 text-red-800 dark:bg-red-900/20"
      case "medium":
        return "bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20"
      case "low":
        return "bg-green-100 border-green-200 text-green-800 dark:bg-green-900/20"
      default:
        return "bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-900/20"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const stats = {
    totalAppointments: appointments.length,
    pendingApprovals: appointments.filter((apt) => apt.status === "pending").length,
    todayScheduled: appointments.filter((apt) => apt.status === "approved").length,
    highPriority: appointments.filter((apt) => apt.severity === "high").length,
  }

  return (
    <DoctorLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Doctor Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your appointments and patient consultations</p>
          </div>
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium">Dr. Sarah Johnson</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending Approvals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingApprovals}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Today's Schedule</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayScheduled}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">High Priority</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.highPriority}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <AppointmentList 
          appointments={appointments} 
          onStatusChange={handleAppointmentAction} 
        />
      </div>
    </DoctorLayout>
  )
}