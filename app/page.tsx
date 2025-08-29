"use client"

import dynamic from 'next/dynamic'
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Heart,
  Shield,
  Zap,
  Users,
  Calendar,
  MessageSquare,
  Activity,
  Stethoscope,
  Brain,
  Clock,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { ClientOnly } from "@/components/client-only"
import { Loading } from "@/components/loading"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

// Disable SSR for this component to prevent hydration issues
const HomePage = dynamic(() => Promise.resolve(HomePageComponent), { 
  ssr: false,
  loading: () => <Loading />
})

function HomePageComponent() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Safe error handling for browser extensions
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message?.toLowerCase() || ""
      const extensionKeywords = [
        "metamask",
        "ethereum",
        "web3",
        "coinbase",
        "wallet",
        "crypto",
        "blockchain",
        "extension",
        "injected",
        "provider",
      ]

      if (extensionKeywords.some((keyword) => errorMessage.includes(keyword))) {
        event.preventDefault()
        event.stopPropagation()
        console.log("Extension error suppressed:", event.message)
        return false
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason).toLowerCase()
      const extensionKeywords = [
        "metamask",
        "ethereum",
        "web3",
        "coinbase",
        "wallet",
        "crypto",
        "blockchain",
        "extension",
        "injected",
        "provider",
        "connect",
      ]

      if (extensionKeywords.some((keyword) => reason.includes(keyword))) {
        event.preventDefault()
        console.log("Extension promise rejection suppressed:", event.reason)
        return false
      }
    }

    // Handle hydration errors
    const handleHydrationError = () => {
      console.log("Hydration error detected, attempting to recover...")
      // Force a re-render to recover from hydration issues
      window.location.reload()
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    
    // Listen for hydration errors
    if (typeof window !== 'undefined') {
      const originalConsoleError = console.error
      console.error = (...args) => {
        const message = args.join(' ').toLowerCase()
        if (message.includes('hydration') || message.includes('server rendered html')) {
          console.log("Hydration warning suppressed:", args)
          return
        }
        originalConsoleError.apply(console, args)
      }
    }

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  const handleBookAppointment = async (formData: FormData) => {
    try {
      setIsBooking(true)

      const appointmentData = {
        patientName: formData.get("patientName") as string,
        patientEmail: formData.get("patientEmail") as string,
        patientPhone: formData.get("patientPhone") as string,
        appointmentDate: formData.get("appointmentDate") as string,
        appointmentTime: formData.get("appointmentTime") as string,
        reason: formData.get("reason") as string,
        symptoms: formData.get("symptoms") as string,
        patientId: "patient_" + Date.now(),
      }

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(appointmentData),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Appointment Booked! 🎉",
          description: "Your appointment has been scheduled successfully. Doctor notified via email in real-time.",
        })
        setIsBookingOpen(false)
      } else {
        throw new Error(data.error || "Failed to book appointment")
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

  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            MEDIBOT
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    MEDIBOT
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">AI Health Companion</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Book an Appointment</DialogTitle>
                      <DialogDescription>Schedule a consultation with our medical professionals</DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleBookAppointment(new FormData(e.currentTarget))
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="patientName">Full Name</Label>
                          <Input id="patientName" name="patientName" placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="patientEmail">Email</Label>
                          <Input
                            id="patientEmail"
                            name="patientEmail"
                            type="email"
                            placeholder="patient@example.com"
                            defaultValue="patient@example.com"
                            required
                          />
                        </div>
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
                          placeholder="Describe any symptoms you're experiencing..."
                          rows={3}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isBooking}>
                        {isBooking ? "Booking..." : "Book Appointment"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button asChild>
                  <Link href="/login">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className="max-w-4xl mx-auto">
              <Badge className="mb-6 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
                <Zap className="h-3 w-3 mr-1" />
                AI-Powered Healthcare Platform
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Your Personal AI Health Companion
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Experience the future of healthcare with MEDIBOT - an intelligent platform that analyzes symptoms,
                provides health insights, and connects you with medical professionals 24/7.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  asChild
                >
                  <Link href="/patient/chat">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Start AI Chat
                  </Link>
                </Button>
                <Button size="lg" variant="outline" onClick={() => setIsBookingOpen(true)}>
                  <Calendar className="h-5 w-5 mr-2" />
                  Book Appointment
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white/50 dark:bg-gray-800/50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Comprehensive Healthcare Solutions
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our AI-powered platform provides complete healthcare management with cutting-edge technology
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-blue-900 dark:text-blue-100">AI Symptom Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-blue-700 dark:text-blue-200">
                    Advanced AI analyzes your symptoms and provides intelligent health insights with personalized
                    recommendations and severity assessment.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-green-900 dark:text-green-100">Smart Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-green-700 dark:text-green-200">
                    Seamlessly book appointments with qualified doctors. AI prioritizes urgent cases and matches you with
                    the right specialists.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-purple-900 dark:text-purple-100">Live Vital Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-purple-700 dark:text-purple-200">
                    Real-time monitoring of vital signs with IoT integration. Get alerts and track your health metrics
                    continuously.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                <CardHeader>
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-orange-900 dark:text-orange-100">Expert Consultations</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-orange-700 dark:text-orange-200">
                    Connect with certified medical professionals through video calls, messaging, and phone consultations
                    anytime, anywhere.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20">
                <CardHeader>
                  <div className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-pink-900 dark:text-pink-100">Secure & Private</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-pink-700 dark:text-pink-200">
                    Your health data is protected with enterprise-grade security. HIPAA compliant with end-to-end
                    encryption.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20">
                <CardHeader>
                  <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-teal-900 dark:text-teal-100">24/7 Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-teal-700 dark:text-teal-200">
                    Round-the-clock AI assistance and emergency support. Get immediate help when you need it most, day or
                    night.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">How MEDIBOT Works</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Simple steps to get the healthcare you deserve
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Describe Your Symptoms</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Chat with our AI assistant about your health concerns. Describe symptoms, ask questions, and get instant
                  insights.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Get AI Analysis</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our advanced AI analyzes your symptoms, assesses severity, and provides personalized health
                  recommendations.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Connect with Doctors</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Book appointments with qualified doctors, get prescriptions, and receive ongoing care through our
                  platform.
                </p>
              </div>
            </div>
          </div>
        </section>



        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Healthcare Experience?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust MEDIBOT for their healthcare needs. Start your journey to better health
              today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
                <Link href="/register">
                  <Users className="h-5 w-5 mr-2" />
                  Create Account
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                asChild
              >
                <Link href="/patient/chat">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Try AI Chat Now
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">MEDIBOT</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Your trusted AI health companion, providing intelligent healthcare solutions 24/7.
                </p>
                <div className="flex space-x-4">
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Services</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="/patient/chat" className="hover:text-white transition-colors">
                      AI Symptom Analysis
                    </Link>
                  </li>
                  <li>
                    <Link href="/patient/appointments" className="hover:text-white transition-colors">
                      Doctor Consultations
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition-colors">
                      Vital Monitoring
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition-colors">
                      Health Records
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="#" className="hover:text-white transition-colors">
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition-colors">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Company</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="#" className="hover:text-white transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition-colors">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition-colors">
                      News
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; 2024 MEDIBOT. All rights reserved. Built with ❤️ for better healthcare.</p>
            </div>
          </div>
        </footer>
      </div>
    </ClientOnly>
  )
}

export default function Page() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // If user is authenticated and has a role, redirect to their dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      const role = session.user.role as string
      if (role === 'admin') router.push('/admin/dashboard')
      else if (role === 'doctor') router.push('/doctor/dashboard')
      else if (role === 'patient') router.push('/patient/dashboard')
    }
  }, [status, session, router])
  
  // Show the home page
  return <HomePage />
}