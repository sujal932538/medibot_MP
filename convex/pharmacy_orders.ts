import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new medicine order
export const createMedicineOrder = mutation({
  args: {
    patientId: v.string(),
    pharmacyId: v.id("pharmacies"),
    medicines: v.array(v.object({
      id: v.string(),
      name: v.string(),
      quantity: v.number(),
      price: v.number(),
    })),
    totalAmount: v.number(),
    deliveryAddress: v.string(),
    patientPhone: v.string(),
    patientName: v.string(),
    specialInstructions: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    orderDate: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("medicineOrders", args);
  },
});

// Get medicine order by ID
export const getMedicineOrderById = query({
  args: { id: v.id("medicineOrders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get medicine orders for a patient
export const getMedicineOrders = query({
  args: { patientId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("medicineOrders")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();
  },
});

// Get medicine orders for a pharmacy
export const getPharmacyOrders = query({
  args: { pharmacyId: v.id("pharmacies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("medicineOrders")
      .withIndex("by_pharmacy", (q) => q.eq("pharmacyId", args.pharmacyId))
      .collect();
  },
});

// Update medicine order
export const updateMedicineOrder = mutation({
  args: {
    id: v.id("medicineOrders"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("out_for_delivery"),
      v.literal("delivered"),
      v.literal("cancelled")
    )),
    deliveryTime: v.optional(v.string()),
    trackingNumber: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Delete medicine order
export const deleteMedicineOrder = mutation({
  args: { id: v.id("medicineOrders") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Get order statistics
export const getOrderStats = query({
  args: {
    pharmacyId: v.optional(v.id("pharmacies")),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let orders = await ctx.db.query("medicineOrders").collect();

    // Filter by pharmacy if specified
    if (args.pharmacyId) {
      orders = orders.filter((order) => order.pharmacyId === args.pharmacyId);
    }

    // Filter by date range
    orders = orders.filter((order) => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= cutoffDate;
    });

    // Calculate statistics
    const stats = orders.reduce(
      (acc, order) => {
        acc.total++;
        acc[order.status]++;
        acc.totalRevenue += order.totalAmount;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        confirmed: 0,
        preparing: 0,
        out_for_delivery: 0,
        delivered: 0,
        cancelled: 0,
        totalRevenue: 0,
      } as Record<string, number>
    );

    return {
      ...stats,
      averageOrderValue: stats.total > 0 ? stats.totalRevenue / stats.total : 0,
      deliveryRate: stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0,
    };
  },
});

// Search orders
export const searchOrders = query({
  args: {
    query: v.string(),
    pharmacyId: v.optional(v.id("pharmacies")),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const searchQuery = args.query.toLowerCase();

    let orders = await ctx.db.query("medicineOrders").collect();

    // Filter by pharmacy if specified
    if (args.pharmacyId) {
      orders = orders.filter((order) => order.pharmacyId === args.pharmacyId);
    }

    // Filter by status if specified
    if (args.status) {
      orders = orders.filter((order) => order.status === args.status);
    }

    // Search in order details
    const searchResults = orders.filter((order) =>
      order.patientName.toLowerCase().includes(searchQuery) ||
      order.deliveryAddress.toLowerCase().includes(searchQuery) ||
      order.medicines.some((medicine) =>
        medicine.name.toLowerCase().includes(searchQuery)
      )
    );

    // Sort by order date (newest first) and apply limit
    searchResults.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    return searchResults.slice(0, limit);
  },
});
