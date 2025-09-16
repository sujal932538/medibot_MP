import { type NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "@/convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

// GET - Fetch specific appointment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const appointmentId = params.id
    
    const appointment = await convex.query(api.appointments.getAppointmentById, { 
      id: appointmentId as any 
    })

    if (!appointment) {
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
    const { status, doctorNotes } = body

    const updatedAppointment = await convex.mutation(api.appointments.respondToAppointment, {
      appointmentId: appointmentId as any,
      response: status,
      doctorNotes,
    })

    console.log(`Appointment ${status} and notifications sent`)

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