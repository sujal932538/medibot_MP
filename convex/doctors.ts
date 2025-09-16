import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Seed initial doctors if none exist
export const seedDoctors = mutation({
  args: {},
  handler: async (ctx) => {
    const existingDoctors = await ctx.db.query("doctors").collect();
    if (existingDoctors.length > 0) {
      return { message: "Doctors already exist", count: existingDoctors.length };
    }
    
    const sampleDoctors = [
      {
        clerkId: "doctor_001",
        name: "Dr. Sarah Johnson",
        specialty: "General Medicine",
        email: "sarah.johnson@medibot.com",
        phone: "+1 (555) 123-4567",
        licenseNumber: "MD123456",
        experience: "8 years",
        education: "MD from Harvard Medical School",
        about: "Dr. Sarah Johnson is a dedicated general practitioner with over 8 years of experience in primary care.",
        languages: ["English", "Spanish"],
        availability: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        consultationFee: 150,
        rating: 4.8,
        totalReviews: 245,
        image: "/placeholder-user.jpg",
        status: "active" as const,
      },
      {
        clerkId: "doctor_002",
        name: "Dr. Michael Chen",
        specialty: "Cardiology",
        email: "michael.chen@medibot.com",
        phone: "+1 (555) 234-5678",
        licenseNumber: "MD234567",
        experience: "12 years",
        education: "MD from Johns Hopkins University",
        about: "Dr. Michael Chen is a board-certified cardiologist with extensive experience in treating heart conditions.",
        languages: ["English", "Mandarin"],
        availability: ["Monday", "Wednesday", "Friday"],
        consultationFee: 250,
        rating: 4.9,
        totalReviews: 189,
        image: "/placeholder-user.jpg",
        status: "active" as const,
      },
      {
        clerkId: "doctor_003",
        name: "Dr. Emily Rodriguez",
        specialty: "Pediatrics",
        email: "emily.rodriguez@medibot.com",
        phone: "+1 (555) 345-6789",
        licenseNumber: "MD345678",
        experience: "10 years",
        education: "MD from Stanford University",
        about: "Dr. Emily Rodriguez is a compassionate pediatrician who has been caring for children and adolescents for over 10 years.",
        languages: ["English", "Spanish"],
        availability: ["Tuesday", "Thursday", "Saturday"],
        consultationFee: 180,
        rating: 4.7,
        totalReviews: 156,
        image: "/placeholder-user.jpg",
        status: "active" as const,
      },
    ];
    
    const createdDoctors = [];
    for (const doctor of sampleDoctors) {
      const doctorId = await ctx.db.insert("doctors", doctor);
      createdDoctors.push(doctorId);
    }
    
    return { message: "Sample doctors created", count: createdDoctors.length };
  },
});
export const createDoctor = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    specialty: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    experience: v.optional(v.string()),
    education: v.optional(v.string()),
    about: v.optional(v.string()),
    languages: v.array(v.string()),
    availability: v.array(v.string()),
    consultationFee: v.number(),
    rating: v.optional(v.number()),
    totalReviews: v.optional(v.number()),
    image: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("doctors", {
      ...args,
      rating: args.rating || 4.5,
      totalReviews: args.totalReviews || 0,
    });
  },
});

export const getAllDoctors = query({
  args: {
    specialty: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let doctors = await ctx.db.query("doctors").filter((q) => q.eq(q.field("status"), "active")).collect();

    if (args.specialty && args.specialty !== "all") {
      doctors = doctors.filter((doc) =>
        doc.specialty.toLowerCase().includes(args.specialty!.toLowerCase())
      );
    }

    if (args.search) {
      doctors = doctors.filter(
        (doc) =>
          doc.name.toLowerCase().includes(args.search!.toLowerCase()) ||
          doc.specialty.toLowerCase().includes(args.search!.toLowerCase())
      );
    }

    return doctors;
  },
});

export const getDoctorById = query({
  args: { id: v.id("doctors") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getDoctorByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("doctors")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const updateDoctor = mutation({
  args: {
    id: v.id("doctors"),
    name: v.optional(v.string()),
    specialty: v.optional(v.string()),
    phone: v.optional(v.string()),
    experience: v.optional(v.string()),
    education: v.optional(v.string()),
    about: v.optional(v.string()),
    consultationFee: v.optional(v.number()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const deleteDoctor = mutation({
  args: { id: v.id("doctors") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});