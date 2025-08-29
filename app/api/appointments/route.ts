import { type NextRequest, NextResponse } from "next/server"
import { createAppointment, getAppointments } from "@/lib/database"


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

// POST - Create new appointment
export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/appointments - Creating new appointment")

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("JSON parsing error:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    console.log("Received appointment data:", body)

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
      doctor_id: body.doctorId || null,
      doctor_name: body.doctorName || null,
      doctor_email: body.doctorEmail || null,
      appointment_date: body.appointmentDate,
      appointment_time: body.appointmentTime,
      reason: body.reason.trim(),
      symptoms: body.symptoms?.trim() || "",
      status: "pending" as const,
      consultation_fee: body.consultationFee || 0,
    }

    // Save to database
    const newAppointment = await createAppointment(appointmentData)

    console.log("Appointment created successfully:", newAppointment.id)

    // Send real-time email notification to doctor if doctor is specified
    if (appointmentData.doctor_email) {
      try {
        const emailResponse = await fetch(`${request.nextUrl.origin}/api/notifications/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "appointmentRequest",
            appointment: newAppointment,
          }),
        })

        if (emailResponse.ok) {
          console.log("Real-time email notification sent to doctor successfully")
        } else {
          console.error("Failed to send email notification to doctor")
        }
      } catch (emailError) {
        console.error("Error sending email notification:", emailError)
      }
    }
    return NextResponse.json(
      {
        success: true,
        message: "Appointment booked successfully. Doctor notified via email in real-time.",
        appointment: newAppointment,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to create appointment",
      },
      { status: 500 },
    )
  }
}

// GET - Fetch appointments
export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/appointments - Fetching appointments")

    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")
    const doctorId = searchParams.get("doctorId")
    const status = searchParams.get("status")

    const appointments = await getAppointments(
      patientId || undefined,
      doctorId || undefined,
      status || undefined
    )

    console.log(`Found ${appointments.length} appointments`)

    return NextResponse.json({
      success: true,
      appointments,
      total: appointments.length,
    })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to fetch appointments",
      },
      { status: 500 },
    )
  }
}

// PUT - Update appointment
export async function PUT(request: NextRequest) {
  try {
    console.log("PUT /api/appointments - Updating appointment")

    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("JSON parsing error:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { id, status, doctorId, doctorName } = body

    if (!id) {
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
    }

    // Find appointment
    const appointmentIndex = appointments.findIndex((apt) => apt.id === id)
    if (appointmentIndex === -1) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Update appointment
    const updatedAppointment = {
      ...appointments[appointmentIndex],
      ...(status && { status }),
      ...(doctorId && { doctorId }),
      ...(doctorName && { doctorName }),
      updatedAt: new Date().toISOString(),
    }

    appointments[appointmentIndex] = updatedAppointment

    console.log("Appointment updated successfully:", id)

    return NextResponse.json({
      success: true,
      message: "Appointment updated successfully",
      appointment: updatedAppointment,
    })
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to update appointment",
      },
      { status: 500 },
    )
  }
}

// DELETE - Remove appointment
export async function DELETE(request: NextRequest) {
  try {
    console.log("DELETE /api/appointments - Deleting appointment")

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 })
    }

    // Find and remove appointment
    const appointmentIndex = appointments.findIndex((apt) => apt.id === id)
    if (appointmentIndex === -1) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    const deletedAppointment = appointments.splice(appointmentIndex, 1)[0]

    console.log("Appointment deleted successfully:", id)

    return NextResponse.json({
      success: true,
      message: "Appointment deleted successfully",
      appointment: deletedAppointment,
    })
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to delete appointment",
      },
      { status: 500 },
    )
  }
}
