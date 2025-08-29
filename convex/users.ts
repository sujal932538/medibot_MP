import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export type UserRole = "patient" | "doctor" | "admin"

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique()
  },
})

export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("patient"), v.literal("doctor"), v.literal("admin")),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique()

    if (existingUser) {
      throw new Error("User already exists")
    }

    return await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: args.role,
      password: args.password,
      createdAt: Date.now(),
    })
  },
})