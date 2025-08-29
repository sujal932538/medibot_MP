import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new pharmacy
export const createPharmacy = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    deliveryTime: v.optional(v.string()),
    medicines: v.array(v.object({
      id: v.string(),
      name: v.string(),
      price: v.number(),
      description: v.optional(v.string()),
      inStock: v.boolean(),
    })),
    status: v.union(v.literal("active"), v.literal("inactive")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pharmacies", args);
  },
});

// Get all pharmacies
export const getAllPharmacies = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let pharmacies = await ctx.db.query("pharmacies").collect();

    // Filter by status
    if (args.status) {
      pharmacies = pharmacies.filter((pharmacy) => pharmacy.status === args.status);
    }

    // Filter by search query
    if (args.search) {
      const searchQuery = args.search.toLowerCase();
      pharmacies = pharmacies.filter((pharmacy) =>
        pharmacy.name.toLowerCase().includes(searchQuery) ||
        pharmacy.address.toLowerCase().includes(searchQuery)
      );
    }

    // Sort by name
    pharmacies.sort((a, b) => a.name.localeCompare(b.name));

    // Apply limit if specified
    if (args.limit) {
      pharmacies = pharmacies.slice(0, args.limit);
    }

    return pharmacies;
  },
});

// Get pharmacy by ID
export const getPharmacyById = query({
  args: { id: v.id("pharmacies") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get pharmacies by location (simple text-based search)
export const getPharmaciesByLocation = query({
  args: {
    location: v.string(),
    radius: v.optional(v.number()), // in kilometers (for future implementation)
  },
  handler: async (ctx, args) => {
    const location = args.location.toLowerCase();
    const pharmacies = await ctx.db.query("pharmacies").collect();

    // Filter by location (simple text matching for now)
    // In a real app, you'd use geospatial queries
    return pharmacies.filter((pharmacy) =>
      pharmacy.address.toLowerCase().includes(location) ||
      pharmacy.name.toLowerCase().includes(location)
    );
  },
});

// Get pharmacies with specific medicine
export const getPharmaciesWithMedicine = query({
  args: {
    medicineName: v.string(),
    inStock: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const medicineName = args.medicineName.toLowerCase();
    const pharmacies = await ctx.db.query("pharmacies").collect();

    return pharmacies.filter((pharmacy) => {
      const hasMedicine = pharmacy.medicines.some((medicine) => {
        const matchesName = medicine.name.toLowerCase().includes(medicineName);
        const matchesStock = args.inStock === undefined || medicine.inStock === args.inStock;
        return matchesName && matchesStock;
      });
      return hasMedicine;
    });
  },
});

// Update pharmacy details
export const updatePharmacy = mutation({
  args: {
    id: v.id("pharmacies"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    deliveryTime: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Add medicine to pharmacy
export const addMedicineToPharmacy = mutation({
  args: {
    pharmacyId: v.id("pharmacies"),
    medicine: v.object({
      id: v.string(),
      name: v.string(),
      price: v.number(),
      description: v.optional(v.string()),
      inStock: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    const updatedMedicines = [...pharmacy.medicines, args.medicine];
    return await ctx.db.patch(args.pharmacyId, { medicines: updatedMedicines });
  },
});

// Update medicine in pharmacy
export const updateMedicineInPharmacy = mutation({
  args: {
    pharmacyId: v.id("pharmacies"),
    medicineId: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      price: v.optional(v.number()),
      description: v.optional(v.string()),
      inStock: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    const updatedMedicines = pharmacy.medicines.map((medicine) =>
      medicine.id === args.medicineId ? { ...medicine, ...args.updates } : medicine
    );

    return await ctx.db.patch(args.pharmacyId, { medicines: updatedMedicines });
  },
});

// Remove medicine from pharmacy
export const removeMedicineFromPharmacy = mutation({
  args: {
    pharmacyId: v.id("pharmacies"),
    medicineId: v.string(),
  },
  handler: async (ctx, args) => {
    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    const updatedMedicines = pharmacy.medicines.filter(
      (medicine) => medicine.id !== args.medicineId
    );

    return await ctx.db.patch(args.pharmacyId, { medicines: updatedMedicines });
  },
});

// Update medicine stock
export const updateMedicineStock = mutation({
  args: {
    pharmacyId: v.id("pharmacies"),
    medicineId: v.string(),
    inStock: v.boolean(),
  },
  handler: async (ctx, args) => {
    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    const updatedMedicines = pharmacy.medicines.map((medicine) =>
      medicine.id === args.medicineId ? { ...medicine, inStock: args.inStock } : medicine
    );

    return await ctx.db.patch(args.pharmacyId, { medicines: updatedMedicines });
  },
});

// Delete pharmacy
export const deletePharmacy = mutation({
  args: { id: v.id("pharmacies") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Get pharmacy statistics
export const getPharmacyStats = query({
  handler: async (ctx) => {
    const pharmacies = await ctx.db.query("pharmacies").collect();

    const stats = pharmacies.reduce(
      (acc, pharmacy) => {
        acc.totalPharmacies++;
        acc[pharmacy.status]++;
        acc.totalMedicines += pharmacy.medicines.length;
        acc.inStockMedicines += pharmacy.medicines.filter((m) => m.inStock).length;
        acc.outOfStockMedicines += pharmacy.medicines.filter((m) => !m.inStock).length;

        // Calculate average price
        if (pharmacy.medicines.length > 0) {
          const totalPrice = pharmacy.medicines.reduce((sum, m) => sum + m.price, 0);
          acc.totalPrice += totalPrice;
          acc.pharmacyCount++;
        }

        return acc;
      },
      {
        totalPharmacies: 0,
        active: 0,
        inactive: 0,
        totalMedicines: 0,
        inStockMedicines: 0,
        outOfStockMedicines: 0,
        totalPrice: 0,
        pharmacyCount: 0,
      }
    );

    return {
      ...stats,
      averageMedicinePrice: stats.pharmacyCount > 0 ? stats.totalPrice / stats.totalMedicines : 0,
      stockRate: stats.totalMedicines > 0 ? (stats.inStockMedicines / stats.totalMedicines) * 100 : 0,
    };
  },
});

// Get medicine inventory across all pharmacies
export const getMedicineInventory = query({
  args: {
    search: v.optional(v.string()),
    inStock: v.optional(v.boolean()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const pharmacies = await ctx.db.query("pharmacies").collect();
    const inventory: Array<{
      medicineId: string;
      name: string;
      price: number;
      description?: string;
      inStock: boolean;
      pharmacyId: string;
      pharmacyName: string;
      pharmacyAddress: string;
    }> = [];

    // Collect all medicines from all pharmacies
    pharmacies.forEach((pharmacy) => {
      pharmacy.medicines.forEach((medicine) => {
        inventory.push({
          medicineId: medicine.id,
          name: medicine.name,
          price: medicine.price,
          description: medicine.description,
          inStock: medicine.inStock,
          pharmacyId: pharmacy._id,
          pharmacyName: pharmacy.name,
          pharmacyAddress: pharmacy.address,
        });
      });
    });

    // Apply filters
    let filteredInventory = inventory;

    if (args.search) {
      const searchQuery = args.search.toLowerCase();
      filteredInventory = filteredInventory.filter((item) =>
        item.name.toLowerCase().includes(searchQuery) ||
        item.description?.toLowerCase().includes(searchQuery) ||
        item.pharmacyName.toLowerCase().includes(searchQuery)
      );
    }

    if (args.inStock !== undefined) {
      filteredInventory = filteredInventory.filter((item) => item.inStock === args.inStock);
    }

    if (args.minPrice !== undefined) {
      filteredInventory = filteredInventory.filter((item) => item.price >= args.minPrice!);
    }

    if (args.maxPrice !== undefined) {
      filteredInventory = filteredInventory.filter((item) => item.price <= args.maxPrice!);
    }

    // Sort by name, then by price
    filteredInventory.sort((a, b) => {
      const nameComparison = a.name.localeCompare(b.name);
      if (nameComparison !== 0) return nameComparison;
      return a.price - b.price;
    });

    return filteredInventory;
  },
});

// Get pharmacy delivery zones (for future implementation)
export const getPharmacyDeliveryZones = query({
  args: { pharmacyId: v.id("pharmacies") },
  handler: async (ctx, args) => {
    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    // For now, return basic delivery info
    // In a real app, this would include geospatial data
    return {
      pharmacyId: args.pharmacyId,
      deliveryTime: pharmacy.deliveryTime || "2-4 hours",
      deliveryRadius: "5 km", // Placeholder
      deliveryFee: 5.00, // Placeholder
      freeDeliveryThreshold: 50.00, // Placeholder
    };
  },
});

// Get pharmacy operating hours (for future implementation)
export const getPharmacyOperatingHours = query({
  args: { pharmacyId: v.id("pharmacies") },
  handler: async (ctx, args) => {
    const pharmacy = await ctx.db.get(args.pharmacyId);
    if (!pharmacy) {
      throw new Error("Pharmacy not found");
    }

    // For now, return default operating hours
    // In a real app, this would be stored in the database
    return {
      pharmacyId: args.pharmacyId,
      operatingHours: {
        monday: { open: "8:00 AM", close: "8:00 PM" },
        tuesday: { open: "8:00 AM", close: "8:00 PM" },
        wednesday: { open: "8:00 AM", close: "8:00 PM" },
        thursday: { open: "8:00 AM", close: "8:00 PM" },
        friday: { open: "8:00 AM", close: "8:00 PM" },
        saturday: { open: "9:00 AM", close: "6:00 PM" },
        sunday: { open: "10:00 AM", close: "4:00 PM" },
      },
      isOpen: true, // Placeholder - would calculate based on current time
    };
  },
});

// Get pharmacy reviews and ratings (for future implementation)
export const getPharmacyReviews = query({
  args: { 
    pharmacyId: v.id("pharmacies"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // For now, return empty array
    // In a real app, this would query a reviews table
    return [];
  },
});

// Search pharmacies by medicine availability
export const searchPharmaciesByMedicine = query({
  args: {
    medicineNames: v.array(v.string()),
    location: v.optional(v.string()),
    maxPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const pharmacies = await ctx.db.query("pharmacies").collect();
    const results: Array<{
      pharmacy: any;
      availableMedicines: any[];
      totalPrice: number;
      matchScore: number;
    }> = [];

    pharmacies.forEach((pharmacy) => {
      const availableMedicines: any[] = [];
      let totalPrice = 0;
      let matchScore = 0;

      args.medicineNames.forEach((medicineName) => {
        const medicine = pharmacy.medicines.find((m) =>
          m.name.toLowerCase().includes(medicineName.toLowerCase()) && m.inStock
        );

        if (medicine) {
          availableMedicines.push(medicine);
          totalPrice += medicine.price;
          matchScore += 1;
        }
      });

      // Apply price filter
      if (args.maxPrice && totalPrice > args.maxPrice) {
        return;
      }

      // Apply location filter
      if (args.location && !pharmacy.address.toLowerCase().includes(args.location.toLowerCase())) {
        return;
      }

      if (availableMedicines.length > 0) {
        results.push({
          pharmacy,
          availableMedicines,
          totalPrice,
          matchScore,
        });
      }
    });

    // Sort by match score (highest first), then by total price (lowest first)
    results.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return a.totalPrice - b.totalPrice;
    });

    return results;
  },
});