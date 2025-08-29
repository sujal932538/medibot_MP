import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Send appointment notification to doctor
export async function POST(request: NextRequest) {
  try {
    const { appointmentId, doctorId, patientId, appointmentData } = await request.json();

    if (!appointmentId || !doctorId || !patientId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get doctor details
    const doctor = await convex.query(api.doctors.getDoctorById, { id: doctorId });
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    // Get patient details
    const patient = await convex.query(api.users.getUserByClerkId, { clerkId: patientId });
    
    // Create notification data
    const notificationData = {
      type: "appointment_request",
      recipientId: doctorId,
      recipientType: "doctor",
      title: "New Appointment Request",
      message: `New appointment request from ${patient?.firstName || 'Patient'} ${patient?.lastName || ''}`,
      data: {
        appointmentId,
        patientId,
        patientName: appointmentData.patientName,
        patientEmail: appointmentData.patientEmail,
        appointmentDate: appointmentData.appointmentDate,
        appointmentTime: appointmentData.appointmentTime,
        reason: appointmentData.reason,
        symptoms: appointmentData.symptoms,
      },
      status: "unread",
    };

    // Save notification to database (you'll need to create a notifications table)
    // const notificationId = await convex.mutation(api.notifications.createNotification, notificationData);

    // Send email notification (using a service like SendGrid, Resend, or Nodemailer)
    await sendDoctorEmail(doctor, appointmentData, patient);

    // Send in-app notification
    await sendInAppNotification(doctorId, notificationData);

    return NextResponse.json({
      success: true,
      message: "Appointment notification sent successfully",
      notificationData,
    });

  } catch (error) {
    console.error("Error sending appointment notification:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}

// Send email to doctor
async function sendDoctorEmail(doctor: any, appointmentData: any, patient: any) {
  try {
    // For now, we'll use a simple email service
    // In production, use SendGrid, Resend, or similar
    
    const emailContent = {
      to: doctor.email,
      subject: "New Appointment Request - MEDIBOT",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">🏥 New Appointment Request</h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Patient Information</h3>
            <p><strong>Name:</strong> ${appointmentData.patientName}</p>
            <p><strong>Email:</strong> ${appointmentData.patientEmail}</p>
            <p><strong>Phone:</strong> ${appointmentData.patientPhone || 'Not provided'}</p>
          </div>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">Appointment Details</h3>
            <p><strong>Date:</strong> ${appointmentData.appointmentDate}</p>
            <p><strong>Time:</strong> ${appointmentData.appointmentTime}</p>
            <p><strong>Reason:</strong> ${appointmentData.reason}</p>
            ${appointmentData.symptoms ? `<p><strong>Symptoms:</strong> ${appointmentData.symptoms}</p>` : ''}
          </div>

          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #166534; margin-top: 0;">Action Required</h3>
            <p>Please review this appointment request and respond within 24 hours.</p>
            <p>You can approve, reject, or request more information through your MEDIBOT dashboard.</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/doctor/appointments" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View in Dashboard
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            This is an automated notification from MEDIBOT. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    // For now, just log the email content
    // In production, integrate with your email service
    console.log("Email to be sent:", emailContent);

    // TODO: Integrate with email service
    // await sendEmail(emailContent);

  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Send in-app notification
async function sendInAppNotification(doctorId: string, notificationData: any) {
  try {
    // This would typically involve WebSocket or Server-Sent Events
    // For now, we'll just log it
    console.log("In-app notification for doctor:", doctorId, notificationData);
    
    // TODO: Implement real-time notifications
    // await sendWebSocketNotification(doctorId, notificationData);
    
  } catch (error) {
    console.error("Error sending in-app notification:", error);
  }
}

// Get notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const userType = searchParams.get("userType");

    if (!userId || !userType) {
      return NextResponse.json(
        { error: "Missing userId or userType" },
        { status: 400 }
      );
    }

    // Get notifications from database
    // const notifications = await convex.query(api.notifications.getUserNotifications, {
    //   userId,
    //   userType,
    // });

    // For now, return mock data
    const notifications = [
      {
        id: "1",
        type: "appointment_request",
        title: "New Appointment Request",
        message: "Patient John Doe requested an appointment",
        status: "unread",
        timestamp: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      notifications,
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
