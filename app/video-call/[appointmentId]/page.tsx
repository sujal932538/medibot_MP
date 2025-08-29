"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, VideoOff, Mic, MicOff, Phone, MessageSquare, Settings } from "lucide-react"
import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"

export default function VideoCallPage() {
  const params = useParams()
  const { user } = useUser()
  const { toast } = useToast()
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [sessionData, setSessionData] = useState<any>(null)

  const appointmentId = params.appointmentId as string

  useEffect(() => {
    initializeVideoCall()
  }, [appointmentId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isConnected])

  const initializeVideoCall = async () => {
    try {
      const response = await fetch("/api/vonage/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentId,
          userRole: user?.publicMetadata?.role || "patient",
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSessionData(data)
        setIsConnected(true)
        toast({
          title: "Video Call Ready",
          description: "Connected to video session successfully",
        })
      }
    } catch (error) {
      console.error("Error initializing video call:", error)
      toast({
        title: "Connection Error",
        description: "Failed to connect to video session",
        variant: "destructive",
      })
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const endCall = () => {
    setIsConnected(false)
    toast({
      title: "Call Ended",
      description: "Video consultation has been ended",
    })
    // In production, redirect to appointment summary
    window.close()
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Connecting..."}
          </Badge>
          {isConnected && (
            <span className="text-white text-sm">
              Duration: {formatDuration(callDuration)}
            </span>
          )}
        </div>
        <div className="text-white">
          <h1 className="text-lg font-semibold">MEDIBOT Video Consultation</h1>
          <p className="text-sm text-gray-300">Appointment #{appointmentId}</p>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-black">
        {/* Remote Video (Doctor) */}
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <div className="text-center text-white">
            <Video className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">Waiting for doctor to join...</p>
            <p className="text-sm text-gray-400">Session ID: {sessionData?.sessionId}</p>
          </div>
        </div>

        {/* Local Video (Patient) - Picture in Picture */}
        <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-700 rounded-lg border-2 border-white overflow-hidden">
          <div className="w-full h-full bg-gray-600 flex items-center justify-center">
            <div className="text-center text-white">
              <User className="h-8 w-8 mx-auto mb-2" />
              <p className="text-xs">You</p>
            </div>
          </div>
        </div>

        {/* Call Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-4 bg-gray-800/90 backdrop-blur-sm rounded-full px-6 py-3">
            <Button
              size="sm"
              variant={isAudioOn ? "default" : "destructive"}
              onClick={() => setIsAudioOn(!isAudioOn)}
              className="rounded-full w-12 h-12 p-0"
            >
              {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            
            <Button
              size="sm"
              variant={isVideoOn ? "default" : "destructive"}
              onClick={() => setIsVideoOn(!isVideoOn)}
              className="rounded-full w-12 h-12 p-0"
            >
              {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={endCall}
              className="rounded-full w-12 h-12 p-0"
            >
              <Phone className="h-5 w-5" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="rounded-full w-12 h-12 p-0"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="rounded-full w-12 h-12 p-0"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 p-4 text-center">
        <p className="text-gray-300 text-sm">
          Powered by Vonage Video API • Secure & HIPAA Compliant
        </p>
      </div>
    </div>
  )
}