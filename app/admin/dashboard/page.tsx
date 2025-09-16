"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, UserCheck, Calendar, Pill, Plus, Edit, Trash2, Mail, Phone } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function AdminDashboard() {
  const doctors = useQuery(api.doctors.getAllDoctors, {}) || []
  const appointments = useQuery(api.appointments.getAllAppointments, {}) || []
  const pharmacies = useQuery(api.pharmacies.getAllPharmacies, {}) || []


  const stats = {
    totalPatients: 1247, // This would come from a users query in production
    activeDoctors: doctors.filter(d => d.status === "active").length,
    todayAppointments: appointments.filter(apt => {
      const today = new Date().toISOString().split('T')[0]
      return apt.appointmentDate === today
    }).length,
    activePharmacies: pharmacies.filter(p => p.status === "active").length,
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage doctors, pharmacies, and monitor platform activity
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Patients</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalPatients.toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Doctors</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeDoctors}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Today's Appointments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayAppointments}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Pharmacies</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activePharmacies}</p>
                </div>
                <Pill className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="doctors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="doctors">Doctor Management</TabsTrigger>
            <TabsTrigger value="pharmacies">Pharmacy Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Doctor Management</CardTitle>
                    <CardDescription>Manage doctor profiles and availability</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Doctor
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {doctors.map((doctor) => (
                    <div key={doctor._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <UserCheck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{doctor.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{doctor.specialty}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{doctor.email}</span>
                            </div>
                            {doctor.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{doctor.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">${doctor.consultationFee} fee</p>
                          <p className="text-xs text-gray-500">⭐ {doctor.rating} rating</p>
                        </div>
                        <Badge variant={doctor.status === "active" ? "default" : "secondary"}>
                          {doctor.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pharmacies" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pharmacy Management</CardTitle>
                    <CardDescription>Manage pharmacy partners and delivery services</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pharmacy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pharmacies.map((pharmacy) => (
                    <div key={pharmacy._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <Pill className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{pharmacy.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{pharmacy.address}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            {pharmacy.email && (
                              <div className="flex items-center space-x-1">
                                <Mail className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{pharmacy.email}</span>
                              </div>
                            )}
                            {pharmacy.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{pharmacy.phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">Delivery: {pharmacy.deliveryTime || "N/A"}</p>
                        </div>
                        <Badge variant={pharmacy.status === "active" ? "default" : "secondary"}>
                          {pharmacy.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Usage</CardTitle>
                  <CardDescription>Daily active users and consultations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Consultations Today</span>
                      <span className="font-semibold">247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Appointments Booked</span>
                      <span className="font-semibold">35</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Medicine Orders</span>
                      <span className="font-semibold">89</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Users</span>
                      <span className="font-semibold">1,247</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Platform performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ESP32 Devices Connected</span>
                      <Badge variant="default">892 Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">AI Response Time</span>
                      <Badge variant="default">1.2s avg</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">System Uptime</span>
                      <Badge variant="default">99.9%</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Performance</span>
                      <Badge variant="default">Optimal</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
