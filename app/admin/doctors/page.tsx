"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { useToast } from "@/hooks/use-toast"

interface Doctor {
  id: number
  name: string
  specialty: string
  email: string
  phone: string
  licenseNumber: string
  status: "active" | "inactive"
  patients: number
  appointments: number
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      specialty: "General Medicine",
      email: "sarah.johnson@medibot.com",
      phone: "+1 (555) 123-4567",
      licenseNumber: "MD123456",
      status: "active",
      patients: 45,
      appointments: 12,
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialty: "Cardiology",
      email: "michael.chen@medibot.com",
      phone: "+1 (555) 234-5678",
      licenseNumber: "MD234567",
      status: "active",
      patients: 38,
      appointments: 8,
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      specialty: "Pediatrics",
      email: "emily.rodriguez@medibot.com",
      phone: "+1 (555) 345-6789",
      licenseNumber: "MD345678",
      status: "inactive",
      patients: 52,
      appointments: 15,
    },
  ])

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const { toast } = useToast()

  const handleAddDoctor = (formData: FormData) => {
    const newDoctor: Doctor = {
      id: Date.now(),
      name: formData.get("name") as string,
      specialty: formData.get("specialty") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      licenseNumber: formData.get("licenseNumber") as string,
      status: "active",
      patients: 0,
      appointments: 0,
    }

    setDoctors(prev => [...prev, newDoctor])
    setIsAddDialogOpen(false)
    toast({
      title: "Doctor Added Successfully",
      description: `${newDoctor.name} has been added to the system.`,
    })
  }

  const handleEditDoctor = (formData: FormData) => {
    if (!editingDoctor) return

    const updatedDoctor: Doctor = {
      ...editingDoctor,
      name: formData.get("name") as string,
      specialty: formData.get("specialty") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      licenseNumber: formData.get("licenseNumber") as string,
      status: formData.get("status") as "active" | "inactive",
    }

    setDoctors(prev => prev.map(doc => doc.id === editingDoctor.id ? updatedDoctor : doc))
    setEditingDoctor(null)
    toast({
      title: "Doctor Updated Successfully",
      description: `${updatedDoctor.name}'s information has been updated.`,
    })
  }

  const handleDeleteDoctor = (doctorId: number) => {
    const doctor = doctors.find(d => d.id === doctorId)
    setDoctors(prev => prev.filter(doc => doc.id !== doctorId))
    toast({
      title: "Doctor Removed",
      description: `${doctor?.name} has been removed from the system.`,
    })
  }

  const DoctorForm = ({ doctor, onSubmit }: { doctor?: Doctor; onSubmit: (formData: FormData) => void }) => (
    <form onSubmit={(e) => {
      e.preventDefault()
      onSubmit(new FormData(e.currentTarget))
    }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" defaultValue={doctor?.name} placeholder="Dr. John Smith" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="specialty">Specialty</Label>
          <Select name="specialty" defaultValue={doctor?.specialty}>
            <SelectTrigger>
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General Medicine">General Medicine</SelectItem>
              <SelectItem value="Cardiology">Cardiology</SelectItem>
              <SelectItem value="Pediatrics">Pediatrics</SelectItem>
              <SelectItem value="Dermatology">Dermatology</SelectItem>
              <SelectItem value="Psychiatry">Psychiatry</SelectItem>
              <SelectItem value="Orthopedics">Orthopedics</SelectItem>
              <SelectItem value="Neurology">Neurology</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={doctor?.email} placeholder="doctor@medibot.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={doctor?.phone} placeholder="+1 (555) 123-4567" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License Number</Label>
          <Input id="licenseNumber" name="licenseNumber" defaultValue={doctor?.licenseNumber} placeholder="MD123456" required />
        </div>
        {doctor && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={doctor.status}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <Button type="submit" className="w-full">
        {doctor ? "Update Doctor" : "Add Doctor"}
      </Button>
    </form>
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Doctor Management</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage doctor profiles and their access to the platform</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Doctor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Doctor</DialogTitle>
                <DialogDescription>Enter the doctor's information to add them to the platform</DialogDescription>
              </DialogHeader>
              <DoctorForm onSubmit={handleAddDoctor} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor.id} className="\
