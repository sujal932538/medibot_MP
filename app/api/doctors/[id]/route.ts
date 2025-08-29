import { type NextRequest, NextResponse } from "next/server"
import { getDoctorById } from "@/lib/database"


// GET - Fetch specific doctor by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const doctorId = params.id
    const doctor = await getDoctorById(doctorId)

    return NextResponse.json({
      success: true,
      doctor
    })
  } catch (error) {
    console.error("Error fetching doctor:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch doctor details" },
      { status: error instanceof Error && error.message === "Doctor not found" ? 404 : 500 }
    )
  }
}