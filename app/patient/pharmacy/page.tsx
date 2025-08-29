"use client"

import { useState, useEffect } from "react"
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
import { Pill, Plus, Minus, ShoppingCart, MapPin, Clock, Star, Search } from "lucide-react"
import { PatientLayout } from "@/components/patient-layout"
import { useToast } from "@/hooks/use-toast"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  pharmacyId: string
  pharmacyName: string
}

export default function PharmacyPage() {
  const { user } = useUser()
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedPharmacy, setSelectedPharmacy] = useState<any>(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const pharmacies = useQuery(api.pharmacies.getAllPharmacies) || []
  const orders = useQuery(api.pharmacies.getMedicineOrders, 
    user ? { patientId: user.id } : "skip"
  ) || []

  const createOrder = useMutation(api.pharmacies.createMedicineOrder)

  const filteredPharmacies = pharmacies.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pharmacy.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addToCart = (medicine: any, pharmacy: any) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === medicine.id && item.pharmacyId === pharmacy._id)
      if (existingItem) {
        return prev.map(item =>
          item.id === medicine.id && item.pharmacyId === pharmacy._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        id: medicine.id,
        name: medicine.name,
        price: medicine.price,
        quantity: 1,
        pharmacyId: pharmacy._id,
        pharmacyName: pharmacy.name,
      }]
    })

    toast({
      title: "Added to Cart",
      description: `${medicine.name} added to your cart`,
    })
  }

  const removeFromCart = (medicineId: string, pharmacyId: string) => {
    setCart(prev => prev.filter(item => !(item.id === medicineId && item.pharmacyId === pharmacyId)))
  }

  const updateQuantity = (medicineId: string, pharmacyId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(medicineId, pharmacyId)
      return
    }

    setCart(prev =>
      prev.map(item =>
        item.id === medicineId && item.pharmacyId === pharmacyId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handlePlaceOrder = async (formData: FormData) => {
    if (!user || cart.length === 0) return

    try {
      // Group cart items by pharmacy
      const ordersByPharmacy = cart.reduce((acc, item) => {
        if (!acc[item.pharmacyId]) {
          acc[item.pharmacyId] = {
            pharmacyId: item.pharmacyId,
            pharmacyName: item.pharmacyName,
            medicines: [],
            total: 0,
          }
        }
        acc[item.pharmacyId].medicines.push({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })
        acc[item.pharmacyId].total += item.price * item.quantity
        return acc
      }, {} as any)

      // Create orders for each pharmacy
      for (const order of Object.values(ordersByPharmacy) as any[]) {
        await createOrder({
          patientId: user.id,
          pharmacyId: order.pharmacyId,
          medicines: order.medicines,
          totalAmount: order.total,
          deliveryAddress: formData.get("deliveryAddress") as string,
          patientPhone: formData.get("patientPhone") as string,
        })
      }

      setCart([])
      setIsOrderDialogOpen(false)
      toast({
        title: "Order Placed Successfully! 🎉",
        description: "Your medicine order has been sent to the pharmacy. You'll receive updates via SMS.",
      })
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Mock pharmacy data if Convex is not available
  const mockPharmacies = [
    {
      _id: "pharmacy_1",
      name: "MediCare Pharmacy",
      address: "123 Health St, Medical District",
      phone: "+1 (555) 111-2222",
      email: "orders@medicare-pharmacy.com",
      deliveryTime: "30-45 mins",
      medicines: [
        { id: "med_1", name: "Paracetamol 500mg", price: 5.99, description: "Pain relief and fever reducer", inStock: true },
        { id: "med_2", name: "Vitamin D3", price: 12.99, description: "Bone health supplement", inStock: true },
        { id: "med_3", name: "Cough Syrup", price: 8.50, description: "Relief from dry cough", inStock: true },
      ],
      status: "active",
    },
    {
      _id: "pharmacy_2",
      name: "QuickMeds Express",
      address: "456 Wellness Ave, Downtown",
      phone: "+1 (555) 333-4444",
      email: "support@quickmeds.com",
      deliveryTime: "20-30 mins",
      medicines: [
        { id: "med_4", name: "Ibuprofen 400mg", price: 7.99, description: "Anti-inflammatory medication", inStock: true },
        { id: "med_5", name: "Multivitamin", price: 15.99, description: "Daily vitamin supplement", inStock: true },
        { id: "med_6", name: "Antacid Tablets", price: 6.50, description: "Stomach acid relief", inStock: false },
      ],
      status: "active",
    },
  ]

  const displayPharmacies = pharmacies.length > 0 ? pharmacies : mockPharmacies

  return (
    <PatientLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pharmacy</h1>
            <p className="text-gray-600 dark:text-gray-300">Order medicines from local pharmacies</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </Badge>
              )}
            </div>
            {cart.length > 0 && (
              <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Checkout (${getTotalAmount().toFixed(2)})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Complete Your Order</DialogTitle>
                    <DialogDescription>Review your cart and provide delivery details</DialogDescription>
                  </DialogHeader>
                  
                  {/* Cart Summary */}
                  <div className="space-y-4">
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {cart.map((item) => (
                        <div key={`${item.id}-${item.pharmacyId}`} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.pharmacyName}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.pharmacyId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.pharmacyId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center font-bold">
                        <span>Total: ${getTotalAmount().toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Order Form */}
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      handlePlaceOrder(new FormData(e.currentTarget))
                    }} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="deliveryAddress">Delivery Address</Label>
                        <Textarea
                          id="deliveryAddress"
                          name="deliveryAddress"
                          placeholder="Enter your complete delivery address..."
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patientPhone">Phone Number</Label>
                        <Input
                          id="patientPhone"
                          name="patientPhone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Place Order - ${getTotalAmount().toFixed(2)}
                      </Button>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search pharmacies or medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Pharmacies */}
        <div className="space-y-6">
          {filteredPharmacies.map((pharmacy) => (
            <Card key={pharmacy._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Pill className="h-5 w-5 text-green-600" />
                      <span>{pharmacy.name}</span>
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{pharmacy.address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{pharmacy.deliveryTime}</span>
                      </div>
                    </CardDescription>
                  </div>
                  <Badge variant="default">Open</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pharmacy.medicines?.map((medicine) => (
                    <div key={medicine.id} className="border rounded-lg p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{medicine.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{medicine.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-green-600">${medicine.price}</span>
                        <Badge variant={medicine.inStock ? "default" : "secondary"}>
                          {medicine.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={!medicine.inStock}
                        onClick={() => addToCart(medicine, pharmacy)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add to Cart
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders */}
        {orders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your medicine order history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Order #{order._id.slice(-8)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {order.medicines.length} items • ${order.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order._creationTime).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        order.status === "delivered" ? "default" :
                        order.status === "confirmed" ? "secondary" :
                        order.status === "cancelled" ? "destructive" : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PatientLayout>
  )
}