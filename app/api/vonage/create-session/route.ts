import { NextRequest, NextResponse } from "next/server";
import { Vonage } from "@vonage/server-sdk";

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY || "your_vonage_api_key",
  apiSecret: process.env.VONAGE_API_SECRET || "your_vonage_api_secret",
});

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, patientId, doctorId, patientName, doctorName } = await request.json();

    if (!appointmentId || !patientId || !doctorId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a Vonage video session
    const session = await vonage.video.createSession({
      name: `appointment-${appointmentId}`,
      mediaMode: "routed", // For recording and better quality
      recordingMode: "manual", // Allow manual recording control
      archiveMode: "manual", // Allow manual archiving
    });

    if (!session.sessionId) {
      throw new Error("Failed to create Vonage session");
    }

    // Generate tokens for patient and doctor
    const patientToken = vonage.video.generateToken(session.sessionId, {
      role: "publisher",
      data: `patient-${patientId}`,
      expireTime: Math.floor(Date.now() / 1000) + (60 * 60 * 2), // 2 hours
    });

    const doctorToken = vonage.video.generateToken(session.sessionId, {
      role: "moderator", // Doctor has moderator privileges
      data: `doctor-${doctorId}`,
      expireTime: Math.floor(Date.now() / 1000) + (60 * 60 * 2), // 2 hours
    });

    // Create session data
    const sessionData = {
      sessionId: session.sessionId,
      appointmentId,
      patientId,
      doctorId,
      patientName,
      doctorName,
      patientToken,
      doctorToken,
      status: "created",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
    };

    // TODO: Save session data to your database
    // await saveVideoSession(sessionData);

    return NextResponse.json({
      success: true,
      session: sessionData,
    });

  } catch (error) {
    console.error("Error creating Vonage session:", error);
    return NextResponse.json(
      { error: "Failed to create video session" },
      { status: 500 }
    );
  }
}

// Get session information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get session details from Vonage
    const session = await vonage.video.getSession(sessionId);

    // TODO: Get additional session data from your database
    // const sessionData = await getVideoSession(sessionId);

    return NextResponse.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        status: session.status,
        // ... other session details
      },
    });

  } catch (error) {
    console.error("Error fetching Vonage session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

// End/archive session
export async function DELETE(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Archive the session (this will save the recording)
    const archive = await vonage.video.archive(sessionId, {
      name: `appointment-${sessionId}`,
      hasAudio: true,
      hasVideo: true,
    });

    // TODO: Update session status in your database
    // await updateVideoSession(sessionId, { status: "archived", archiveId: archive.id });

    return NextResponse.json({
      success: true,
      message: "Session archived successfully",
      archiveId: archive.id,
    });

  } catch (error) {
    console.error("Error archiving Vonage session:", error);
    return NextResponse.json(
      { error: "Failed to archive session" },
      { status: 500 }
    );
  }
}
