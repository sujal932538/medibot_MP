import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new appointment
export const createAppointment = mutation({
  args: {
    patientId: v.string(),
    patientName: v.string(),
    patientEmail: v.string(),
    patientPhone: v.optional(v.string()),
    doctorId: v.optional(v.string()),
    doctorName: v.optional(v.string()),
    doctorEmail: v.optional(v.string()),
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
    return await ctx.db.insert("appointments", {
      ...args,
      status: "pending",
      meetingLink: args.meetingLink || `https://medibot-meet.com/room/${Date.now()}`,
    });
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