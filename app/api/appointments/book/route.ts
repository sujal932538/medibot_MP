import { type NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// Helper function to validate appointment data
function validateAppointmentData(data: any) {
  const required = ["patientName", "patientEmail", "appointmentDate", "appointmentTime", "reason"]
  const missing = required.filter((field) => !data[field])

  if (missing.length > 0) {
    return { valid: false, message: `Missing required fields: ${missing.join(", ")}` }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.patientEmail)) {
    return { valid: false, message: "Invalid email format" }
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(data.appointmentDate)) {
    return { valid: false, message: "Invalid date format. Use YYYY-MM-DD" }
  }

  // Validate time format (HH:MM)
  const timeRegex = /^\d{2}:\d{2}$/
  if (!timeRegex.test(data.appointmentTime)) {
    return { valid: false, message: "Invalid time format. Use HH:MM" }
  }

  return { valid: true }
}

// POST - Book appointment with specific doctor
export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/appointments/book - Booking appointment with doctor")

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("JSON parsing error:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    console.log("Received booking data:", body)

    // Validate required fields
    const validation = validateAppointmentData(body)
    if (!validation.valid) {
      console.error("Validation error:", validation.message)
      return NextResponse.json({ error: validation.message }, { status: 400 })
    }

    // Create appointment data
    const appointmentData = {
      patient_id: body.patientId || "patient_ronakw",
      patient_name: body.patientName.trim(),
      patient_email: body.patientEmail.trim().toLowerCase(),
      patient_phone: body.patientPhone?.trim() || "",
      doctor_id: body.doctorId,
      doctor_name: body.doctorName,
      doctor_email: body.doctorEmail,
      specialty: body.specialty,
      appointment_date: body.appointmentDate,
      appointment_time: body.appointmentTime,
      reason: body.reason.trim(),
      symptoms: body.symptoms?.trim() || "",
      consultation_fee: body.consultationFee || 0,
    }

    // Save to database
    const appointmentId = await convex.mutation(api.appointments.createAppointment, appointmentData)

    console.log("Appointment created successfully:", appointmentId)

    return NextResponse.json(
      {
        success: true,
        message: "Appointment booked successfully! Available doctor assigned and notified via email.",
        appointmentId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error booking appointment:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to book appointment",
      },
      { status: 500 },
    )
  }
}