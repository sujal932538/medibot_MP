import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// Create a new appointment
export const createAppointment = mutation({
  args: {
    patientId: v.string(),
    patientName: v.string(),
    patientEmail: v.string(),
    patientPhone: v.optional(v.string()),
    doctorId: v.optional(v.id("doctors")),
    doctorName: v.optional(v.string()),
    doctorEmail: v.optional(v.string()),
    specialty: v.optional(v.string()),
    appointmentDate: v.string(),
    appointmentTime: v.string(),
    reason: v.string(),
    symptoms: v.optional(v.string()),
    consultationFee: v.number(),
    meetingLink: v.optional(v.string()),
    doctorNotes: v.optional(v.string()),
    vonageSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let assignedDoctor = null;
    
    // If no specific doctor is requested, find an available doctor
    if (!args.doctorId) {
      const availableDoctors = await ctx.db
        .query("doctors")
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect();
      
      // Filter by specialty if provided
      let filteredDoctors = availableDoctors;
      if (args.specialty) {
        filteredDoctors = availableDoctors.filter(doc => 
          doc.specialty.toLowerCase().includes(args.specialty!.toLowerCase())
        );
      }
      
      // If no doctors match specialty, use any available doctor
      if (filteredDoctors.length === 0) {
        filteredDoctors = availableDoctors;
      }
      
      // Select doctor with least appointments (load balancing)
      if (filteredDoctors.length > 0) {
        const doctorAppointmentCounts = await Promise.all(
          filteredDoctors.map(async (doctor) => {
            const appointments = await ctx.db
              .query("appointments")
              .withIndex("by_doctor", (q) => q.eq("doctorId", doctor._id))
              .filter((q) => q.eq(q.field("status"), "pending"))
              .collect();
            return { doctor, count: appointments.length };
          })
        );
        
        // Sort by appointment count (ascending) and select the first one
        doctorAppointmentCounts.sort((a, b) => a.count - b.count);
        assignedDoctor = doctorAppointmentCounts[0].doctor;
      }
    } else {
      // Get the specific requested doctor
      assignedDoctor = await ctx.db.get(args.doctorId);
    }
    
    if (!assignedDoctor) {
      throw new Error("No available doctors found");
    }
    
    const appointmentId = await ctx.db.insert("appointments", {
      ...args,
      doctorId: assignedDoctor._id,
      doctorName: assignedDoctor.name,
      doctorEmail: assignedDoctor.email,
      status: "pending",
      meetingLink: args.meetingLink || `https://medibot-meet.com/room/${Date.now()}`,
    });
    
    // Schedule email notification to doctor
    await ctx.scheduler.runAfter(0, internal.appointments.sendDoctorNotification, {
      appointmentId,
    });
    
    return appointmentId;
  },
});

// Get appointments with filtering (updated to use proper types)
export const getAppointments = query({
  args: {
    patientId: v.optional(v.string()),
    doctorId: v.optional(v.id("doctors")),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let appointments = await ctx.db.query("appointments").collect();

    // Filter by patient ID
    if (args.patientId) {
      appointments = appointments.filter((apt) => apt.patientId === args.patientId);
    }

    // Filter by doctor ID
    if (args.doctorId) {
      appointments = appointments.filter((apt) => apt.doctorId === args.doctorId);
    }

    // Filter by status
    if (args.status) {
      appointments = appointments.filter((apt) => apt.status === args.status);
    }

    // Sort by date (newest first)
    appointments.sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

    // Apply limit if specified
    if (args.limit) {
      appointments = appointments.slice(0, args.limit);
    }

    return appointments;
  },
});

// Internal function to send doctor notification
export const sendDoctorNotification = internal.mutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    
    // In a real implementation, this would send an email
    // For now, we'll log the notification
    console.log(`Email notification sent to ${appointment.doctorEmail} for appointment ${args.appointmentId}`);
    
    // You can integrate with email services like SendGrid, Resend, etc. here
    return null;
  },
});

// Doctor approves or rejects appointment
export const respondToAppointment = mutation({
  args: {
    appointmentId: v.id("appointments"),
    response: v.union(v.literal("approved"), v.literal("rejected")),
    doctorNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    
    const updates: any = {
      status: args.response,
      doctorNotes: args.doctorNotes || "",
    };
    
    // If approved, create video call session
    if (args.response === "approved") {
      const vonageSessionId = `session_${args.appointmentId}_${Date.now()}`;
      const meetingLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/video-call/${args.appointmentId}`;
      
      updates.vonageSessionId = vonageSessionId;
      updates.meetingLink = meetingLink;
      
      // Schedule patient notification
      await ctx.scheduler.runAfter(0, internal.appointments.sendPatientNotification, {
        appointmentId: args.appointmentId,
        approved: true,
      });
    } else {
      // Schedule rejection notification
      await ctx.scheduler.runAfter(0, internal.appointments.sendPatientNotification, {
        appointmentId: args.appointmentId,
        approved: false,
      });
    }
    
    await ctx.db.patch(args.appointmentId, updates);
    return appointment;
  },
});

// Internal function to send patient notification
export const sendPatientNotification = internal.mutation({
  args: { 
    appointmentId: v.id("appointments"),
    approved: v.boolean(),
  },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    
    const message = args.approved 
      ? `Your appointment with ${appointment.doctorName} has been approved! Meeting link: ${appointment.meetingLink}`
      : `Your appointment request has been declined. Please book another appointment.`;
    
    console.log(`Email notification sent to ${appointment.patientEmail}: ${message}`);
    
    // You can integrate with email services here
    return null;
  },
});
// Get all appointments with optional filtering
export const getAllAppointments = query({
  args: {
    patientId: v.optional(v.string()),
    doctorId: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let appointments = await ctx.db.query("appointments").collect();

    // Filter by patient ID
    if (args.patientId) {
      appointments = appointments.filter((apt) => apt.patientId === args.patientId);
    }

    // Filter by doctor ID
    if (args.doctorId) {
      appointments = appointments.filter((apt) => apt.doctorId === args.doctorId);
    }

    // Filter by status
    if (args.status) {
      appointments = appointments.filter((apt) => apt.status === args.status);
    }

    // Sort by date (newest first)
    appointments.sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime());

    // Apply limit if specified
    if (args.limit) {
      appointments = appointments.slice(0, args.limit);
    }

    return appointments;
  },
});

// Get appointment by ID
export const getAppointmentById = query({
  args: { id: v.id("appointments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get appointments for a specific patient
export const getPatientAppointments = query({
  args: { patientId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();
  },
});

// Get appointments for a specific doctor
export const getDoctorAppointments = query({
  args: { doctorId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .collect();
  },
});

// Get appointments by status
export const getAppointmentsByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appointments")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

// Update appointment status
export const updateAppointmentStatus = mutation({
  args: {
    id: v.id("appointments"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, { status: args.status });
  },
});

// Update appointment details
export const updateAppointment = mutation({
  args: {
    id: v.id("appointments"),
    patientName: v.optional(v.string()),
    patientEmail: v.optional(v.string()),
    patientPhone: v.optional(v.string()),
    appointmentDate: v.optional(v.string()),
    appointmentTime: v.optional(v.string()),
    reason: v.optional(v.string()),
    symptoms: v.optional(v.string()),
    consultationFee: v.optional(v.number()),
    meetingLink: v.optional(v.string()),
    doctorNotes: v.optional(v.string()),
    vonageSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Delete appointment
export const deleteAppointment = mutation({
  args: { id: v.id("appointments") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Get appointment statistics
export const getAppointmentStats = query({
  handler: async (ctx) => {
    const appointments = await ctx.db.query("appointments").collect();
    
    const stats = appointments.reduce(
      (acc, apt) => {
        acc.total++;
        acc[apt.status] = (acc[apt.status] || 0) + 1;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        approved: 0,
        completed: 0,
        rejected: 0,
        cancelled: 0,
      } as Record<string, number>
    );

    return stats;
  },
});

// Get upcoming appointments
export const getUpcomingAppointments = query({
  args: {
    patientId: v.optional(v.string()),
    doctorId: v.optional(v.string()),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    let appointments = await ctx.db.query("appointments").collect();

    // Filter by date range
    appointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= new Date() && aptDate <= cutoffDate;
    });

    // Filter by patient ID
    if (args.patientId) {
      appointments = appointments.filter((apt) => apt.patientId === args.patientId);
    }

    // Filter by doctor ID
    if (args.doctorId) {
      appointments = appointments.filter((apt) => apt.doctorId === args.doctorId);
    }

    // Sort by date and time
    appointments.sort((a, b) => {
      const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
      const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
      return dateA.getTime() - dateB.getTime();
    });

    return appointments;
  },
});