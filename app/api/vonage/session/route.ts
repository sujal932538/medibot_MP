import { NextRequest, NextResponse } from "next/server";
import { createVideoSession, generateToken } from "@/lib/vonage";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// POST - Create Vonage video session for appointment
export async function POST(request: NextRequest) {
  try {
    const { appointmentId, userRole } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Create video session
    const videoSession = await createVideoSession(appointmentId);

    // Generate token for user
    const token = await generateToken(videoSession.sessionId, 'publisher');

    // Update appointment with session details
    await convex.mutation(api.appointments.updateAppointment, {
      id: appointmentId as any,
      vonageSessionId: videoSession.sessionId,
      meetingLink: `${process.env.NEXT_PUBLIC_APP_URL}/video-call/${appointmentId}`,
    });

    return NextResponse.json({
      success: true,
      sessionId: videoSession.sessionId,
      token,
      apiKey: videoSession.apiKey,
      meetingLink: `${process.env.NEXT_PUBLIC_APP_URL}/video-call/${appointmentId}`,
    });
  } catch (error) {
    console.error("Error creating Vonage session:", error);
    return NextResponse.json(
      { error: "Failed to create video session" },
      { status: 500 }
    );
  }
}