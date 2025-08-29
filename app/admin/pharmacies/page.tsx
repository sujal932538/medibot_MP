"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, MapPin, Clock, Pill, Phone, Mail } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

export default function PharmaciesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingPharmacy, setEditingPharmacy] = useState<any>(null)
  const { toast } = useToast()

  const pharmacies = useQuery(api.pharmacies.getAllPharmacies) || []
  const createPharmacy = useMutation(api.pharmacies.createPharmacy)
  const updatePharmacy = useMutation(api.pharmacies.updatePharmacy)

  const handleAddPharmacy = async (formData: FormData) => {
    try {
      const medicines = [
        { id: "med_1", name: "Paracetamol 500mg", price: 5.99, description: "Pain relief", inStock: true },
        { id: "med_2", name: "Vitamin D3", price: 12.99, description: "Bone health", inStock: true },
        { id: "med_3", name: "Cough Syrup", price: 8.50, description: "Cough relief", inStock: true },
      ]

      await createPharmacy({
        name: formData.get("name") as string,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        deliveryTime: formData.get("deliveryTime") as string,
        medicines,
      })

      setIsAddDialogOpen(false)
      toast({
        title: "Pharmacy Added Successfully",
        description: "New pharmacy has been added to the system.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add pharmacy. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditPharmacy = async (formData: FormData) => {
    if (!editingPharmacy) return

    try {
      await updatePharmacy({
        id: editingPharmacy._id,
        name: formData.get("name") as string,
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        deliveryTime: formData.get("deliveryTime") as string,
      })

      setEditingPharmacy(null)
      toast({
        title: "Pharmacy Updated Successfully",
        description: "Pharmacy information has been updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update pharmacy. Please try again.",
        variant: "destructive",
      })
    }
  }

  const PharmacyForm = ({ pharmacy, onSubmit }: { pharmacy?: any; onSubmit: (formData: FormData) => void }) => (
    <form onSubmit={(e) => {
      e.preventDefault()
      onSubmit(new FormData(e.currentTarget))
    }} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Pharmacy Name</Label>
        <Input id="name" name="name" defaultValue={pharmacy?.name} placeholder="MediCare Pharmacy" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" defaultValue={pharmacy?.address} placeholder="123 Health St, Medical District" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={pharmacy?.phone} placeholder="+1 (555) 123-4567" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={pharmacy?.email} placeholder="orders@pharmacy.com" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="deliveryTime">Delivery Time</Label>
        <Input id="deliveryTime" name="deliveryTime" defaultValue={pharmacy?.deliveryTime} placeholder="30-45 mins" />
      </div>
      <Button type="submit" className="w-full">
        {pharmacy ? "Update Pharmacy" : "Add Pharmacy"}
      </Button>
    </form>
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pharmacy Management</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage pharmacy partners and medicine inventory</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Pharmacy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Pharmacy</DialogTitle>
                <DialogDescription>Enter pharmacy details to add them as a partner</DialogDescription>
              </DialogHeader>
              <PharmacyForm onSubmit={handleAddPharmacy} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pharmacies.map((pharmacy) => (
            <Card key={pharmacy._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Pill className="h-5 w-5 text-green-600" />
                      <span>{pharmacy.name}</span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center space-x-1 mb-1">
                        <MapPin className="h-3 w-3" />
                        <span>{pharmacy.address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Delivery: {pharmacy.deliveryTime}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <Badge variant={pharmacy.status === "active" ? "default" : "secondary"}>
                    {pharmacy.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    {pharmacy.phone && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{pharmacy.phone}</span>
                      </div>
                    )}
                    {pharmacy.email && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span>{pharmacy.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Available Medicines</h4>
                    <div className="space-y-1">
                      {pharmacy.medicines?.slice(0, 3).map((medicine) => (
                        <div key={medicine.id} className="flex items-center justify-between text-sm">
                          <span>{medicine.name}</span>
                          <span className="font-medium">${medicine.price}</span>
                        </div>
                      ))}
                      {pharmacy.medicines && pharmacy.medicines.length > 3 && (
                        <p className="text-xs text-gray-500">+{pharmacy.medicines.length - 3} more medicines</p>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-4 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setEditingPharmacy(pharmacy)}>
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Pharmacy</DialogTitle>
                          <DialogDescription>Update pharmacy information</DialogDescription>
                        </DialogHeader>
                        <PharmacyForm pharmacy={editingPharmacy} onSubmit={handleEditPharmacy} />
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {pharmacies.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Pharmacies Yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Add pharmacy partners to enable medicine delivery services.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Pharmacy
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}