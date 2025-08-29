import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// POST - Receive vitals from ESP32 device
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deviceId, patientId, heartRate, spO2, temperature, bmi } = body;

    // Validate required fields
    if (!deviceId || !patientId) {
      return NextResponse.json(
        { error: "Missing required fields: deviceId, patientId" },
        { status: 400 }
      );
    }

    // Save vitals to Convex database
    const vitalId = await convex.mutation(api.vitals.saveVitals, {
      patientId,
      heartRate: heartRate ? Number(heartRate) : undefined,
      spO2: spO2 ? Number(spO2) : undefined,
      temperature: temperature ? Number(temperature) : undefined,
      bmi: bmi ? Number(bmi) : undefined,
      deviceId,
    });

    console.log(`Vitals saved from ESP32 device ${deviceId} for patient ${patientId}`);

    // Check for abnormal vitals and send alerts
    const alerts = [];
    if (heartRate && (heartRate < 60 || heartRate > 100)) {
      alerts.push(`Abnormal heart rate: ${heartRate} BPM`);
    }
    if (spO2 && spO2 < 95) {
      alerts.push(`Low oxygen saturation: ${spO2}%`);
    }
    if (temperature && (temperature < 97 || temperature > 99.5)) {
      alerts.push(`Abnormal temperature: ${temperature}°F`);
    }

    if (alerts.length > 0) {
      console.log(`ALERT for patient ${patientId}:`, alerts.join(', '));
      // In production, send real-time notifications to patient and doctors
    }

    return NextResponse.json({
      success: true,
      message: "Vitals received and stored successfully",
      vitalId,
      alerts: alerts.length > 0 ? alerts : null,
    });
  } catch (error) {
    console.error("Error processing ESP32 vitals:", error);
    return NextResponse.json(
      { error: "Failed to process vitals data" },
      { status: 500 }
    );
  }
}

// GET - Get latest vitals for device status check
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get("deviceId");
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        { error: "Patient ID is required" },
        { status: 400 }
      );
    }

    const latestVitals = await convex.query(api.vitals.getLatestVitals, {
      patientId,
    });

    return NextResponse.json({
      success: true,
      vitals: latestVitals,
      deviceStatus: "connected",
      lastUpdate: latestVitals?._creationTime || null,
    });
  } catch (error) {
    console.error("Error fetching ESP32 vitals:", error);
    return NextResponse.json(
      { error: "Failed to fetch vitals" },
      { status: 500 }
    );
  }
}