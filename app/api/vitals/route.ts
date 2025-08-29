import { type NextRequest, NextResponse } from "next/server"
import { saveVitals, getVitals } from "@/lib/database"


export async function POST(req: NextRequest) {
  try {
    const { patientId, heartRate, spO2, temperature, bmi } = await req.json()

    const vitalData = {
      patient_id: patientId,
      heart_rate: heartRate,
      spo2: spO2,
      temperature,
      bmi,
    }

    const vitalRecord = await saveVitals(vitalData)

    return NextResponse.json({
      success: true,
      data: vitalRecord,
    })
  } catch (error) {
    console.error("Error saving vitals:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to save vitals data" 
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const patientId = searchParams.get("patientId")

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 })
    }

    const vitals = await getVitals(patientId)

    return NextResponse.json({ 
      success: true,
      vitals 
    })
  } catch (error) {
    console.error("Error fetching vitals:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to fetch vitals" 
    }, { status: 500 })
  }
}
