import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { updateAppointment } from "@/lib/database"


// GET - Fetch specific appointment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id
    
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single()

    if (error || !appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      appointment
    })
  } catch (error) {
    console.error("Error fetching appointment:", error)
    return NextResponse.json(
      { error: "Failed to fetch appointment details" },
      { status: 500 }
    )
  }
}

// PUT - Update appointment status (approve/reject by doctor)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id
    const body = await request.json()
    const { status, doctorNotes, meetingLink } = body

    const updates: any = {
      status,
    }
    
    if (doctorNotes) updates.doctor_notes = doctorNotes
    if (meetingLink) updates.meeting_link = meetingLink

    const updatedAppointment = await updateAppointment(appointmentId, updates)

    // Send real-time email notification to patient
    if (status === "approved") {
      try {
        const emailResponse = await fetch(`${request.nextUrl.origin}/api/notifications/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "appointmentConfirmation",
            appointment: updatedAppointment,
          }),
        })

        if (emailResponse.ok) {
          console.log("Confirmation email sent to patient successfully")
        } else {
          console.error("Failed to send confirmation email to patient")
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment: updatedAppointment
    })
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update appointment" },
      { status: 500 }
    )
  }
}

// DELETE - Cancel appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id
    
    const { data: appointment, error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId)
      .select()
      .single()
    
    if (error || !appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      )
    }


    return NextResponse.json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment
    })
  } catch (error) {
    console.error("Error cancelling appointment:", error)
    return NextResponse.json(
      { error: "Failed to cancel appointment" },
      { status: 500 }
    )
  }
}