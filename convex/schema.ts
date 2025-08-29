import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("patient"), v.literal("doctor"), v.literal("admin")),
    password: v.string(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"]),
})