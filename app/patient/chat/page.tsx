"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, User, Send, Calendar, AlertTriangle, Heart, Sparkles } from "lucide-react"
import { PatientLayout } from "@/components/patient-layout"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  severity?: "low" | "medium" | "high"
  appointmentSuggested?: boolean
  typing?: boolean
}

export default function ChatPage() {
  const formatTime = (date: Date) =>
    new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date)
  const { data: session } = useSession()
  const createAppointment = useMutation(api.appointments.createAppointment)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hey there! 👋 I'm MEDIBOT, your personal AI health companion! I'm here to chat about your health, analyze any symptoms you might have, and help you feel your best. Think of me as your friendly medical assistant who's available 24/7! 😊\n\nWhat's on your mind today? Are you feeling okay, or is there something health-related you'd like to discuss?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [isBookingAppointment, setIsBookingAppointment] = useState(false)
  const [mounted, setMounted] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    setMounted(true)
  }, [])

  const callGeminiAPI = async (userMessage: string) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI response")
      }

      return data
    } catch (error) {
      console.error("Error calling API:", error)

      // Return a fallback response
      return {
        response:
          "I'm having some connection issues right now 😔 But I'm still here to help! If you're experiencing concerning symptoms, please don't hesitate to contact a healthcare provider directly. Your health is important! 💙",
        severity: "medium",
        appointmentNeeded: false,
      }
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setIsTyping(true)

    // Add typing indicator
    const typingMessage: Message = {
      id: "typing",
      content: "",
      sender: "bot",
      timestamp: new Date(),
      typing: true,
    }
    setMessages((prev) => [...prev, typingMessage])

    try {
      const aiResponse = await callGeminiAPI(input)

      // Remove typing indicator
      setMessages((prev) => prev.filter((msg) => msg.id !== "typing"))

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.response,
        sender: "bot",
        timestamp: new Date(),
        severity: aiResponse.severity,
        appointmentSuggested: aiResponse.appointmentNeeded,
      }

      setMessages((prev) => [...prev, botMessage])

      // If appointment is needed, ask for confirmation
      if (aiResponse.appointmentNeeded) {
        setTimeout(() => {
          const appointmentMessage: Message = {
            id: (Date.now() + 2).toString(),
            content:
              "🏥 Based on your symptoms, I think it would be wise to consult with a doctor. Would you like me to help you book an appointment? I can connect you with one of our qualified healthcare professionals who can provide proper medical evaluation and treatment. What do you think?",
            sender: "bot",
            timestamp: new Date(),
            appointmentSuggested: true,
          }
          setMessages((prev) => [...prev, appointmentMessage])
        }, 1500)
      }
    } catch (error) {
      // Remove typing indicator
      setMessages((prev) => prev.filter((msg) => msg.id !== "typing"))

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I'm sorry, I'm having trouble connecting right now. 😔 Please try again in a moment, or if you're experiencing severe symptoms, please contact a healthcare provider directly or call emergency services if it's urgent.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setIsLoading(false)
    setIsTyping(false)
  }

  const handleBookAppointment = async () => {
    if (isBookingAppointment) return

    setIsBookingAppointment(true)

    try {
      console.log("Booking appointment...")

      // Get user symptoms from chat history
      const userSymptoms = messages
        .filter((m) => m.sender === "user")
        .map((m) => m.content)
        .join("; ")

      // Create appointment data
      const appointmentData = {
        patientId: session?.user?.id || "demo_patient",
        patientName: session?.user?.name || "Demo Patient",
        patientEmail: session?.user?.email || "demo@example.com",
        patientPhone: "+1 (555) 123-4567",
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Tomorrow
        appointmentTime: "10:00", // Default time
        reason: "AI Chat Consultation",
        symptoms: userSymptoms || "General consultation requested via AI chat",
        consultationFee: 150,
      }

      console.log("Appointment data:", appointmentData)

      try {
        const appointmentId = await createAppointment(appointmentData)
        console.log("Appointment created:", appointmentId)
        
        toast({
          title: "Appointment Request Sent! 🎉",
          description: "Your appointment request has been sent to our medical team.",
        })

        const confirmationMessage: Message = {
          id: Date.now().toString(),
          content:
            "Perfect! 🎉 I've sent your appointment request to our medical team. Here's what happens next:\n\n✅ A qualified doctor will review your request\n📧 You'll receive confirmation once approved\n📞 The doctor will contact you for the consultation\n💬 You can communicate via message, phone, or video call\n\nIf your symptoms worsen or you feel it's urgent, don't hesitate to seek immediate medical attention! 🏥",
          sender: "bot",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, confirmationMessage])
      } catch (error) {
        throw new Error("Failed to book appointment")
      }
    } catch (error) {
      console.error("Error booking appointment:", error)

      toast({
        title: "Booking Error",
        description: "Failed to book appointment. Please try again or contact support.",
        variant: "destructive",
      })

      const errorMessage: Message = {
        id: Date.now().toString(),
        content:
          "I'm sorry, there was an issue booking your appointment. 😔 Please try again, or you can contact our support team directly. If this is urgent, please don't hesitate to call your healthcare provider!",
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsBookingAppointment(false)
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 border-red-200 dark:bg-red-900/20"
      case "medium":
        return "bg-yellow-100 border-yellow-200 dark:bg-yellow-900/20"
      case "low":
        return "bg-green-100 border-green-200 dark:bg-green-900/20"
      default:
        return ""
    }
  }

  const quickResponses = [
    "I have a headache",
    "I'm feeling tired",
    "I have a fever",
    "My stomach hurts",
    "I can't sleep well",
    "I'm feeling anxious",
  ]

  return (
    <PatientLayout>
      <div className="h-[calc(100vh-200px)] flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <div className="relative">
                <Bot className="h-6 w-6" />
                <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300" />
              </div>
              <span>MEDIBOT - Your AI Health Companion</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                Online & Ready to Help
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-start space-x-2 max-w-[85%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                    >
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback
                          className={
                            message.sender === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-gradient-to-br from-purple-500 to-blue-500 text-white"
                          }
                        >
                          {message.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-2xl p-4 ${
                          message.sender === "user"
                            ? "bg-blue-600 text-white"
                            : `bg-white dark:bg-gray-800 border shadow-sm ${getSeverityColor(message.severity)}`
                        }`}
                      >
                        {message.typing ? (
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        ) : (
                          <>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            {message.severity && (
                              <div className="flex items-center mt-3 space-x-1">
                                <AlertTriangle
                                  className={`h-3 w-3 ${
                                    message.severity === "high"
                                      ? "text-red-500"
                                      : message.severity === "medium"
                                        ? "text-yellow-500"
                                        : "text-green-500"
                                  }`}
                                />
                                <span
                                  className={`text-xs font-medium ${
                                    message.severity === "high"
                                      ? "text-red-600"
                                      : message.severity === "medium"
                                        ? "text-yellow-600"
                                        : "text-green-600"
                                  }`}
                                >
                                  {message.severity.toUpperCase()} PRIORITY
                                </span>
                              </div>
                            )}
                            {message.appointmentSuggested && (
                              <Button
                                size="sm"
                                className="mt-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                                onClick={handleBookAppointment}
                                disabled={isBookingAppointment}
                              >
                                <Calendar className="h-3 w-3 mr-1" />
                                {isBookingAppointment ? "Booking..." : "Book Appointment"}
                              </Button>
                            )}
                          </>
                        )}
                        {mounted && (
                          <p className="text-xs opacity-70 mt-2">{formatTime(message.timestamp)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Quick Response Buttons */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500 mb-2">Quick responses:</p>
                <div className="flex flex-wrap gap-2">
                  {quickResponses.map((response, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent"
                      onClick={() => setInput(response)}
                    >
                      {response}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t p-4 bg-white dark:bg-gray-800">
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tell me about your symptoms or ask any health question..."
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  💡 I provide health guidance but am not a substitute for professional medical advice
                </p>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Heart className="h-3 w-3 text-red-500" />
                  <span>Powered by AI</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientLayout>
  )
}