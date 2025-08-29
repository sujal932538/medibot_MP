import { type NextRequest, NextResponse } from "next/server"

// Mock function to generate video call room
function generateVideoCallRoom(appointmentId: string, doctorId: string, patientId: string) {
  return {
    roomId: `medibot-${appointmentId}`,
    roomUrl: `https://medibot-meet.com/room/${appointmentId}`,
    doctorToken: `doctor_${doctorId}_${Date.now()}`,
    patientToken: `patient_${patientId}_${Date.now()}`,
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
  }
}

// POST - Create video call room for appointment
export async function POST(request: NextRequest) {
  try {
    const { appointmentId, doctorId, patientId } = await request.json()

    if (!appointmentId || !doctorId || !patientId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    // Generate video call room
    const videoCall = generateVideoCallRoom(appointmentId, doctorId, patientId)

    console.log("Video call room created:", videoCall.roomId)

    return NextResponse.json({
      success: true,
      message: "Video call room created successfully",
      videoCall
    })
  } catch (error) {
    console.error("Error creating video call room:", error)
    return NextResponse.json(
      { error: "Failed to create video call room" },
      { status: 500 }
    )
  }
}

// GET - Get video call details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get("appointmentId")

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      )
    }

    // Mock video call details
    const videoCall = {
      roomId: `medibot-${appointmentId}`,
      roomUrl: `https://medibot-meet.com/room/${appointmentId}`,
      status: "active",
      participants: [],
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      videoCall
    })
  } catch (error) {
    console.error("Error fetching video call details:", error)
    return NextResponse.json(
      { error: "Failed to fetch video call details" },
      { status: 500 }
    )
  }
}