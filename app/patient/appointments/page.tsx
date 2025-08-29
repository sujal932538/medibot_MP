"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, XCircle, Plus, MessageSquare, Phone, Video, Star, MapPin, Languages, DollarSign, User, ArrowLeft, Search } from "lucide-react"
import { PatientLayout } from "@/components/patient-layout"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

interface Appointment {
  id: string
  patientName: string
  patientEmail: string
  appointmentDate: string
  appointmentTime: string
  reason: string
  symptoms: string
  status: "pending" | "approved" | "rejected" | "completed"
  createdAt: string
}

interface Doctor {
  id: string
  name: string
  specialty: string
  email: string
  phone: string
  experience: string
  education: string
  about: string
  languages: string[]
  availability: string[]
  consultationFee: number
  rating: number
  totalReviews: number
  image: string
  status: string
  license_number?: string
}
export default function AppointmentsPage() {
  const { user } = useUser()
  const appointments = useQuery(api.appointments.getAppointments, 
    user ? { patientId: user.id } : "skip"
  ) || []
  const doctors = useQuery(api.doctors.getAllDoctors, {}) || []
  const createAppointment = useMutation(api.appointments.createAppointment)

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isDoctorListOpen, setIsDoctorListOpen] = useState(false)
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const { toast } = useToast()

  const specialties = [
    { value: "all", label: "All Specialties" },
    { value: "general", label: "General Medicine" },
    { value: "cardiology", label: "Cardiology" },
    { value: "pediatrics", label: "Pediatrics" },
    { value: "dermatology", label: "Dermatology" },
    { value: "psychiatry", label: "Psychiatry" }
  ]
  useEffect(() => {
    setIsLoading(false)
  }, [])

  const handleBookAppointment = async (formData: FormData) => {
    if (!selectedDoctor) return

    try {
      setIsBooking(true)

      const appointmentData = {
        patientId: user?.id || "demo_patient",
        patientName: formData.get("patientName") as string,
        patientEmail: user?.primaryEmailAddress?.emailAddress || "demo@example.com",
        patientPhone: formData.get("patientPhone") as string,
        doctorId: selectedDoctor._id,
        doctorName: selectedDoctor.name,
        doctorEmail: selectedDoctor.email,
        appointmentDate: formData.get("appointmentDate") as string,
        appointmentTime: formData.get("appointmentTime") as string,
        reason: formData.get("reason") as string,
        symptoms: formData.get("symptoms") as string,
        consultationFee: selectedDoctor.consultationFee,
      }

      console.log("Booking appointment with data:", appointmentData)

      const appointmentId = await createAppointment(appointmentData)
      
      if (appointmentId) {
        toast({
          title: "Appointment Booked! 🎉",
          description: `Your appointment with ${selectedDoctor.name} has been booked successfully!`,
        })

        setIsAppointmentFormOpen(false)
        setSelectedDoctor(null)
      } else {
        throw new Error("Failed to book appointment")
      }
    } catch (error) {
      console.error("Error booking appointment:", error)
      toast({
        title: "Booking Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsBooking(false)
    }
  }

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setIsDoctorListOpen(false)
    setIsAppointmentFormOpen(true)
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === "all" || 
                            doctor.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())
    return matchesSearch && matchesSpecialty
  })
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500"
      case "rejected":
        return "bg-red-500"
      case "pending":
        return "bg-yellow-500"
      case "completed":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 border-green-200 text-green-800 dark:bg-green-900/20"
      case "rejected":
        return "bg-red-100 border-red-200 text-red-800 dark:bg-red-900/20"
      case "pending":
        return "bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20"
      case "completed":
        return "bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/20"
      default:
        return "bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-900/20"
    }
  }

  if (isLoading) {
    return (
      <PatientLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading appointments...</p>
          </div>
        </div>
      </PatientLayout>
    )
  }

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Appointments</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your medical appointments and consultations</p>
          </div>
          <Dialog open={isDoctorListOpen} onOpenChange={setIsDoctorListOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Book New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Select a Doctor</DialogTitle>
                <DialogDescription>Choose from our qualified medical professionals</DialogDescription>
              </DialogHeader>
              
              {/* Search and Filter */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search doctors by name or specialty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty.value} value={specialty.value}>
                          {specialty.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Doctors Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredDoctors.map((doctor) => (
                  <Card key={doctor.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={doctor.image} alt={doctor.name} />
                          <AvatarFallback>
                            {doctor.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                            {doctor.name}
                          </h3>
                          <p className="text-blue-600 font-medium">{doctor.specialty}</p>
                          {doctor.license_number && (
                            <p className="text-xs text-gray-500">License: {doctor.license_number}</p>
                          )}
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium ml-1">{doctor.rating}</span>
                              <span className="text-sm text-gray-500 ml-1">({doctor.totalReviews})</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              <span>{doctor.experience}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-3 w-3 mr-1" />
                              <span>${doctor.consultationFee}</span>
                            </div>
                          </div>
                          {doctor.education && (
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                              🎓 {doctor.education}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                            {doctor.about}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-1">
                              <Languages className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {doctor.languages.join(', ')}
                              </span>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleDoctorSelect(doctor)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Select Doctor
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredDoctors.length === 0 && (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No doctors found matching your criteria</p>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Appointment Form Dialog */}
          <Dialog open={isAppointmentFormOpen} onOpenChange={setIsAppointmentFormOpen}>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAppointmentFormOpen(false)
                      setIsDoctorListOpen(true)
                    }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <DialogTitle>Book Appointment</DialogTitle>
                    <DialogDescription>
                      {selectedDoctor && `Schedule your consultation with ${selectedDoctor.name}`}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {selectedDoctor && (
                <>
                  {/* Doctor Info */}
                  <Card className="mb-3">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedDoctor.image} alt={selectedDoctor.name} />
                          <AvatarFallback>
                            {selectedDoctor.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-base">{selectedDoctor.name}</h3>
                          <p className="text-blue-600 text-sm">{selectedDoctor.specialty}</p>
                          {selectedDoctor.license_number && (
                            <p className="text-xs text-gray-500">License: {selectedDoctor.license_number}</p>
                          )}
                          <div className="flex items-center space-x-3 text-xs text-gray-600">
                            <span>Fee: ${selectedDoctor.consultationFee}</span>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                              <span>{selectedDoctor.rating}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Appointment Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleBookAppointment(new FormData(e.currentTarget))
                    }}
                    className="space-y-3"
                  >
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="patientName">Full Name</Label>
                        <Input id="patientName" name="patientName" defaultValue={user?.fullName || ""} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patientPhone">Phone Number</Label>
                        <Input
                          id="patientPhone"
                          name="patientPhone"
                          type="tel"
                          defaultValue={user?.primaryPhoneNumber?.phoneNumber || ""}
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="appointmentDate">Date</Label>
                        <Input
                          id="appointmentDate"
                          name="appointmentDate"
                          type="date"
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="appointmentTime">Time</Label>
                        <Input id="appointmentTime" name="appointmentTime" type="time" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Visit</Label>
                      <Input id="reason" name="reason" placeholder="General consultation" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="symptoms">Symptoms (Optional)</Label>
                      <Textarea
                        id="symptoms"
                        name="symptoms"
                        placeholder="Please describe your symptoms or reason for the appointment..."
                        rows={2}
                      />
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Consultation Fee:</span>
                        <span className="text-lg font-bold text-green-600">${selectedDoctor.consultationFee}</span>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={isBooking}>
                      {isBooking ? "Booking..." : `Book Appointment - $${selectedDoctor.consultationFee}`}
                    </Button>
                  </form>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Appointments Yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You haven't booked any appointments yet. Book your first consultation with our qualified doctors.
                </p>
                <Button onClick={() => setIsDoctorListOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Book Your First Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <span>Appointment #{appointment._id?.slice(-8)}</span>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(appointment.status)}`} />
                        <Badge variant="outline" className="capitalize">
                          {appointment.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Scheduled: {new Date(appointment.appointmentDate).toLocaleDateString()} at{" "}
                        {appointment.appointmentTime}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusBadgeColor(appointment.status)}>{appointment.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Reason for Visit</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded">
                        {appointment.reason}
                      </p>
                    </div>

                    {appointment.symptoms && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Symptoms</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                          {appointment.symptoms}
                        </p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Patient Information</h4>
                      <div className="flex space-x-6 text-sm">
                        <span>
                          Name: <strong>{appointment.patientName}</strong>
                        </span>
                        <span>
                          Email: <strong>{appointment.patientEmail}</strong>
                        </span>
                      </div>
                    </div>

                    {appointment.status === "approved" && (
                      <div className="flex space-x-2 pt-4 border-t">
                        <Button size="sm">
                          <Video className="h-4 w-4 mr-1" />
                          Join Video Call
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message Doctor
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-1" />
                          Call Doctor
                        </Button>
                      </div>
                    )}

                    {appointment.status === "pending" && (
                      <div className="flex items-center space-x-2 pt-4 border-t">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">Waiting for doctor approval...</span>
                      </div>
                    )}

                    {appointment.status === "rejected" && (
                      <div className="flex items-center space-x-2 pt-4 border-t">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Appointment was not approved. Please book a new one or contact support.
                        </span>
                      </div>
                    )}

                    {appointment.status === "completed" && (
                      <div className="flex items-center space-x-2 pt-4 border-t">
                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Consultation completed. Check your email for follow-up instructions.
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PatientLayout>
  )
}