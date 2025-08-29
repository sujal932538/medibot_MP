import { type NextRequest, NextResponse } from "next/server"

// POST - End video call
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { roomId, userId, userRole, duration, notes } = body

    if (!roomId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: roomId, userId" },
        { status: 400 }
      )
    }

    // In production, save call summary, duration, notes, etc.
    const callSummary = {
      roomId,
      endedBy: userId,
      endedAt: new Date().toISOString(),
      duration: duration || 0, // in minutes
      notes: notes || "",
      participants: [
        { role: "doctor", duration: duration || 0 },
        { role: "patient", duration: duration || 0 }
      ]
    }

    console.log(`Video call ${roomId} ended by ${userId} (${userRole})`)
    console.log("Call summary:", callSummary)

    return NextResponse.json({
      success: true,
      message: "Video call ended successfully",
      callSummary
    })
  } catch (error) {
    console.error("Error ending video call:", error)
    return NextResponse.json(
      { error: "Failed to end video call" },
      { status: 500 }
    )
  }
}