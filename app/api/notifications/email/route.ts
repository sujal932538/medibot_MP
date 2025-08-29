import { type NextRequest, NextResponse } from "next/server"

// Mock email service - in production, use SendGrid, Nodemailer, etc.
interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
}

// Mock email templates
const emailTemplates = {
  appointmentRequest: (appointment: any) => ({
    subject: `New Appointment Request - ${appointment.patientName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .appointment-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .urgent { border-left: 4px solid #ff6b6b; padding-left: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 MEDIBOT - New Appointment Request</h1>
          </div>
          <div class="content">
            <h2>Hello Dr. ${appointment.doctorName?.split(' ')[1] || 'Doctor'},</h2>
            <p>You have received a new appointment request from a patient.</p>
            
            <div class="appointment-details">
              <h3>📋 Patient Information</h3>
              <p><strong>Name:</strong> ${appointment.patientName}</p>
              <p><strong>Email:</strong> ${appointment.patientEmail}</p>
              <p><strong>Phone:</strong> ${appointment.patientPhone || 'Not provided'}</p>
            </div>

            <div class="appointment-details">
              <h3>📅 Appointment Details</h3>
              <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
              <p><strong>Consultation Fee:</strong> $${appointment.consultationFee}</p>
              ${appointment.doctorName ? `<p><strong>Requested Doctor:</strong> ${appointment.doctorName}</p>` : ''}
            </div>

            <div class="appointment-details">
              <h3>🩺 Medical Information</h3>
              <p><strong>Reason for Visit:</strong> ${appointment.reason}</p>
              ${appointment.symptoms ? `<p><strong>Symptoms:</strong> ${appointment.symptoms}</p>` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://medibot.com/doctor/dashboard" class="button" style="background: #28a745;">
                ✅ Approve Appointment
              </a>
              <a href="https://medibot.com/doctor/dashboard" class="button" style="background: #dc3545;">
                ❌ Reject Appointment
              </a>
            </div>

            ${appointment.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${appointment.meetingLink}">${appointment.meetingLink}</a></p>` : ''}
            
            <p>Please log in to your doctor dashboard to manage this appointment request.</p>
            
            <hr style="margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">
              This is a real-time automated message from MEDIBOT. Email sent instantly upon booking.
              <br>For support, contact us at support@medibot.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  appointmentConfirmation: (appointment: any) => ({
    subject: `Appointment Confirmed - ${appointment.doctorName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .appointment-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Appointment Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hello ${appointment.patientName},</h2>
            <p>Great news! Your appointment has been confirmed by ${appointment.doctorName}.</p>
            
            <div class="appointment-details">
              <h3>📅 Appointment Details</h3>
              <p><strong>Doctor:</strong> ${appointment.doctorName}</p>
              <p><strong>Date:</strong> ${new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
              <p><strong>Time:</strong> ${appointment.appointmentTime}</p>
              <p><strong>Consultation Fee:</strong> $${appointment.consultationFee}</p>
              <p><strong>Appointment ID:</strong> #${appointment.id}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${appointment.meetingLink || `https://medibot-meet.com/room/${appointment.id}`}" class="button">
                🎥 Join Video Consultation
              </a>
            </div>

            <p><strong>Important Notes:</strong></p>
            <ul>
              <li>Please join the video call 5 minutes before your scheduled time</li>
              <li>Ensure you have a stable internet connection</li>
              <li>Have your medical history and current medications ready</li>
              <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
            </ul>
            
            <div class="appointment-details">
              <h3>👨‍⚕️ Doctor Information</h3>
              <p><strong>Name:</strong> ${appointment.doctorName}</p>
              <p><strong>Email:</strong> ${appointment.doctorEmail}</p>
              <p><strong>Specialty:</strong> ${appointment.doctorSpecialty || 'General Medicine'}</p>
            </div>
            
            <hr style="margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">
              This is a real-time automated message from MEDIBOT. Email sent instantly upon approval.
              <br>For support, contact us at support@medibot.com
            </p>
          </div>
        </div>
      </div>
      </html>
    `
  })
}

// Mock function to send email
async function sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Simulate real-time email sending with immediate response
    console.log("📧 REAL-TIME EMAIL SENDING...")
    console.log("📧 To:", emailData.to)
    console.log("📧 Subject:", emailData.subject)
    console.log("📧 From:", emailData.from)
    
    // Immediate response to simulate real-time email
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    console.log("✅ EMAIL SENT SUCCESSFULLY IN REAL-TIME!")
    console.log("📧 Message ID:", messageId)
    
    return {
      success: true,
      messageId
    }
  } catch (error) {
    console.error("Email sending error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error"
    }
  }
}

// POST - Send email notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, appointment, recipient } = body

    if (!type || !appointment) {
      return NextResponse.json(
        { error: "Missing required fields: type and appointment" },
        { status: 400 }
      )
    }

    let emailData: EmailData

    switch (type) {
      case "appointmentRequest":
        const requestTemplate = emailTemplates.appointmentRequest(appointment)
        emailData = {
          to: appointment.doctorEmail,
          from: "noreply@medibot.com",
          subject: requestTemplate.subject,
          html: requestTemplate.html
        }
        break

      case "appointmentConfirmation":
        const confirmTemplate = emailTemplates.appointmentConfirmation(appointment)
        emailData = {
          to: appointment.patientEmail,
          from: "noreply@medibot.com",
          subject: confirmTemplate.subject,
          html: confirmTemplate.html
        }
        break

      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 }
        )
    }

    // Send email
    const result = await sendEmail(emailData)

    if (result.success) {
      console.log("✅ Email API response: SUCCESS")
      console.log("📧 Message ID:", result.messageId)
      return NextResponse.json({
        success: true,
        message: "Email sent successfully in real-time!",
        messageId: result.messageId
      })
    } else {
      console.error("❌ Email API response: FAILED")
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error in email API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET - Get email templates (for testing)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (!type) {
      return NextResponse.json({
        success: true,
        availableTypes: Object.keys(emailTemplates)
      })
    }

    // Mock appointment data for template preview
    const mockAppointment = {
      id: "apt_001",
      patientName: "John Doe",
      patientEmail: "john.doe@example.com",
      patientPhone: "+1 (555) 123-4567",
      doctorName: "Dr. Sarah Johnson",
      doctorEmail: "sarah.johnson@medibot.com",
      appointmentDate: "2024-01-25",
      appointmentTime: "14:00",
      reason: "General consultation",
      symptoms: "Persistent headache and fatigue",
      consultationFee: 150,
      meetingLink: "https://medibot-meet.com/room/apt_001"
    }

    if (type === "appointmentRequest") {
      const template = emailTemplates.appointmentRequest(mockAppointment)
      return NextResponse.json({
        success: true,
        template
      })
    }

    if (type === "appointmentConfirmation") {
      const template = emailTemplates.appointmentConfirmation(mockAppointment)
      return NextResponse.json({
        success: true,
        template
      })
    }

    return NextResponse.json(
      { error: "Invalid template type" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error fetching email template:", error)
    return NextResponse.json(
      { error: "Failed to fetch email template" },
      { status: 500 }
    )
  }
}