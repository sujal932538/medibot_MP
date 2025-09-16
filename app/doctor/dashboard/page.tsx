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
import { useUser } from "@clerk/nextjs"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function DoctorDashboard() {
  const { user } = useUser()
  const doctor = useQuery(api.doctors.getDoctorByClerkId, 
    user ? { clerkId: user.id } : "skip"
  )
  const appointments = useQuery(api.appointments.getDoctorAppointments,
    doctor ? { doctorId: doctor._id } : "skip"
  ) || []
  const respondToAppointment = useMutation(api.appointments.respondToAppointment)

  const { toast } = useToast()

  const handleAppointmentAction = async (appointmentId: string, action: "approve" | "reject") => {
    const appointment = appointments.find(apt => apt._id === appointmentId)
    if (!appointment) return

    try {
      await respondToAppointment({
        appointmentId: appointmentId as any,
        response: action === "approve" ? "approved" : "rejected",
        doctorNotes: action === "reject" 
          ? "Doctor is not available at the requested time" 
          : "Appointment confirmed",
      })

      toast({
        title: action === "approve" ? "Appointment Approved" : "Appointment Rejected",
        description: `Patient notified via email in real-time! ${action === "approve" ? "Video call link sent" : "Rejection"} email sent instantly.`,
      })
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast({
        title: "Error",
        description: "Failed to update appointment. Please try again.",
        variant: "destructive",
      })
    }
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
    highPriority: appointments.filter((apt) => apt.symptoms?.toLowerCase().includes("chest pain") || apt.symptoms?.toLowerCase().includes("breathing")).length,
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