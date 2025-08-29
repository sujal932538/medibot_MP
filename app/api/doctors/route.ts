import { type NextRequest, NextResponse } from "next/server"
import { getDoctors } from "@/lib/database"


// GET - Fetch all doctors or filter by specialty
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const specialty = searchParams.get("specialty")
    const search = searchParams.get("search")

    const doctors = await getDoctors(specialty || undefined, search || undefined)

    return NextResponse.json({
      success: true,
      doctors,
      total: doctors.length
    })
  } catch (error) {
    console.error("Error fetching doctors:", error)
    return NextResponse.json(
      { error: "Failed to fetch doctors" },
      { status: 500 }
    )
  }
}