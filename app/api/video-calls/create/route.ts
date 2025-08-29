import { type NextRequest, NextResponse } from "next/server"

// Mock video call service - in production, integrate with Zoom, WebRTC, Agora, etc.
interface VideoCallRoom {
  roomId: string
  roomUrl: string
  doctorToken: string
  patientToken: string
  appointmentId: string
  status: "created" | "active" | "ended"
  participants: Array<{
    id: string
    name: string
    role: "doctor" | "patient"
    joinedAt?: string
    leftAt?: string
  }>
  createdAt: string
  expiresAt: string
  settings: {
    recordingEnabled: boolean
    chatEnabled: boolean
    screenShareEnabled: boolean
    maxDuration: number // in minutes
  }
}

// Mock database for video calls
const videoCalls: VideoCallRoom[] = []

// Helper function to generate secure tokens
function generateToken(userId: string, role: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  return `${role}_${userId}_${timestamp}_${randomString}`
}

// Helper function to generate room ID
function generateRoomId(): string {
  return `medibot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// POST - Create video call room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointmentId, doctorId, patientId, doctorName, patientName } = body

    if (!appointmentId || !doctorId || !patientId) {
      return NextResponse.json(
        { error: "Missing required fields: appointmentId, doctorId, patientId" },
        { status: 400 }
      )
    }

    // Check if room already exists for this appointment
    const existingRoom = videoCalls.find(call => call.appointmentId === appointmentId)
    if (existingRoom) {
      return NextResponse.json({
        success: true,
        message: "Video call room already exists",
        videoCall: existingRoom
      })
    }

    // Create new video call room
    const roomId = generateRoomId()
    const doctorToken = generateToken(doctorId, "doctor")
    const patientToken = generateToken(patientId, "patient")
    
    const videoCall: VideoCallRoom = {
      roomId,
      roomUrl: `https://medibot-meet.com/room/${roomId}`,
      doctorToken,
      patientToken,
      appointmentId,
      status: "created",
      participants: [
        {
          id: doctorId,
          name: doctorName || "Doctor",
          role: "doctor"
        },
        {
          id: patientId,
          name: patientName || "Patient",
          role: "patient"
        }
      ],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
      settings: {
        recordingEnabled: true,
        chatEnabled: true,
        screenShareEnabled: true,
        maxDuration: 60 // 60 minutes
      }
    }

    // Add to mock database
    videoCalls.push(videoCall)

    console.log("Video call room created:", roomId)

    return NextResponse.json({
      success: true,
      message: "Video call room created successfully",
      videoCall: {
        roomId: videoCall.roomId,
        roomUrl: videoCall.roomUrl,
        doctorToken: videoCall.doctorToken,
        patientToken: videoCall.patientToken,
        expiresAt: videoCall.expiresAt,
        settings: videoCall.settings
      }
    })
  } catch (error) {
    console.error("Error creating video call room:", error)
    return NextResponse.json(
      { error: "Failed to create video call room" },
      { status: 500 }
    )
  }
}

// GET - Get video call room details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get("appointmentId")
    const roomId = searchParams.get("roomId")

    if (!appointmentId && !roomId) {
      return NextResponse.json(
        { error: "Either appointmentId or roomId is required" },
        { status: 400 }
      )
    }

    let videoCall: VideoCallRoom | undefined

    if (appointmentId) {
      videoCall = videoCalls.find(call => call.appointmentId === appointmentId)
    } else if (roomId) {
      videoCall = videoCalls.find(call => call.roomId === roomId)
    }

    if (!videoCall) {
      return NextResponse.json(
        { error: "Video call room not found" },
        { status: 404 }
      )
    }

    // Check if room has expired
    if (new Date() > new Date(videoCall.expiresAt)) {
      videoCall.status = "ended"
      return NextResponse.json(
        { error: "Video call room has expired" },
        { status: 410 }
      )
    }

    return NextResponse.json({
      success: true,
      videoCall
    })
  } catch (error) {
    console.error("Error fetching video call room:", error)
    return NextResponse.json(
      { error: "Failed to fetch video call room" },
      { status: 500 }
    )
  }
}