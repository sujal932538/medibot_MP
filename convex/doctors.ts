import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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