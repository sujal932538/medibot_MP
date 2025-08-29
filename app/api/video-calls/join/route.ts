import { type NextRequest, NextResponse } from "next/server"

// POST - Join video call room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, userId, userRole, userName } = body

    if (!roomId || !userId || !userRole) {
      return NextResponse.json(
        { error: "Missing required fields: roomId, userId, userRole" },
        { status: 400 }
      )
    }

    // In production, validate the user's permission to join this room
    // and generate appropriate access tokens

    const joinData = {
      roomId,
      userId,
      userRole,
      userName: userName || (userRole === "doctor" ? "Doctor" : "Patient"),
      joinUrl: `https://medibot-meet.com/room/${roomId}?user=${userId}&role=${userRole}`,
      accessToken: `access_${userId}_${Date.now()}`,
      joinedAt: new Date().toISOString(),
      permissions: {
        canShare: true,
        canRecord: userRole === "doctor",
        canMute: true,
        canChat: true
      }
    }

    console.log(`User ${userId} (${userRole}) joining room ${roomId}`)

    return NextResponse.json({
      success: true,
      message: "Successfully joined video call",
      joinData
    })
  } catch (error) {
    console.error("Error joining video call:", error)
    return NextResponse.json(
      { error: "Failed to join video call" },
      { status: 500 }
    )
  }
}