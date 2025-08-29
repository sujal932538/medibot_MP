import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Save new vital signs
export const saveVitals = mutation({
  args: {
    patientId: v.string(),
    heartRate: v.optional(v.number()),
    spO2: v.optional(v.number()),
    temperature: v.optional(v.number()),
    bmi: v.optional(v.number()),
    deviceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("vitals", {
      ...args,
    });
  },
});

// Get vitals for a specific patient
export const getPatientVitals = query({
  args: { 
    patientId: v.string(),
    limit: v.optional(v.number()),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const days = args.days || 30;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let vitals = await ctx.db
      .query("vitals")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();

    // Filter by date range if specified
    if (args.days) {
      vitals = vitals.filter((vital) => {
        const vitalDate = new Date(vital._creationTime);
        return vitalDate >= cutoffDate;
      });
    }

    // Sort by creation time (newest first) and apply limit
    vitals.sort((a, b) => b._creationTime - a._creationTime);
    return vitals.slice(0, limit);
  },
});

// Get vitals by ID
export const getVitalsById = query({
  args: { id: v.id("vitals") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get latest vitals for a patient
export const getLatestVitals = query({
  args: { patientId: v.string() },
  handler: async (ctx, args) => {
    const vitals = await ctx.db
      .query("vitals")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();

    if (vitals.length === 0) return null;

    // Sort by creation time and return the latest
    vitals.sort((a, b) => b._creationTime - a._creationTime);
    return vitals[0];
  },
});

// Get vitals statistics for a patient
export const getVitalsStats = query({
  args: { 
    patientId: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const vitals = await ctx.db
      .query("vitals")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();

    // Filter by date range
    const recentVitals = vitals.filter((vital) => {
      const vitalDate = new Date(vital._creationTime);
      return vitalDate >= cutoffDate;
    });

    if (recentVitals.length === 0) {
      return {
        totalReadings: 0,
        averageHeartRate: 0,
        averageSpO2: 0,
        averageTemperature: 0,
        averageBMI: 0,
        minHeartRate: 0,
        maxHeartRate: 0,
        minSpO2: 0,
        maxSpO2: 0,
        minTemperature: 0,
        maxTemperature: 0,
      };
    }

    // Calculate statistics
    const heartRates = recentVitals.map(v => v.heartRate).filter(Boolean) as number[];
    const spO2s = recentVitals.map(v => v.spO2).filter(Boolean) as number[];
    const temperatures = recentVitals.map(v => v.temperature).filter(Boolean) as number[];
    const bmis = recentVitals.map(v => v.bmi).filter(Boolean) as number[];

    const calculateStats = (values: number[]) => {
      if (values.length === 0) return { average: 0, min: 0, max: 0 };
      const sum = values.reduce((acc, val) => acc + val, 0);
      return {
        average: sum / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    };

    const heartRateStats = calculateStats(heartRates);
    const spO2Stats = calculateStats(spO2s);
    const temperatureStats = calculateStats(temperatures);
    const bmiStats = calculateStats(bmis);

    return {
      totalReadings: recentVitals.length,
      averageHeartRate: heartRateStats.average,
      averageSpO2: spO2Stats.average,
      averageTemperature: temperatureStats.average,
      averageBMI: bmiStats.average,
      minHeartRate: heartRateStats.min,
      maxHeartRate: heartRateStats.max,
      minSpO2: spO2Stats.min,
      maxSpO2: spO2Stats.max,
      minTemperature: temperatureStats.min,
      maxTemperature: temperatureStats.max,
    };
  },
});

// Get vitals trend data for charts
export const getVitalsTrend = query({
  args: { 
    patientId: v.string(),
    metric: v.union(v.literal("heartRate"), v.literal("spO2"), v.literal("temperature"), v.literal("bmi")),
    days: v.optional(v.number()),
    interval: v.optional(v.union(v.literal("hour"), v.literal("day"), v.literal("week"))),
  },
  handler: async (ctx, args) => {
    const days = args.days || 7;
    const interval = args.interval || "day";
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const vitals = await ctx.db
      .query("vitals")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();

    // Filter by date range
    const recentVitals = vitals.filter((vital) => {
      const vitalDate = new Date(vital._creationTime);
      return vitalDate >= cutoffDate;
    });

    // Sort by creation time
    recentVitals.sort((a, b) => a._creationTime - b._creationTime);

    // Group by interval and calculate averages
    const groupedData: Record<string, { value: number; count: number }> = {};

    recentVitals.forEach((vital) => {
      const date = new Date(vital._creationTime);
      let key: string;

      switch (interval) {
        case "hour":
          key = date.toISOString().slice(0, 13); // YYYY-MM-DDTHH
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().slice(0, 10); // YYYY-MM-DD
          break;
        default: // day
          key = date.toISOString().slice(0, 10); // YYYY-MM-DD
      }

      const value = vital[args.metric];
      if (value !== undefined) {
        if (!groupedData[key]) {
          groupedData[key] = { value: 0, count: 0 };
        }
        groupedData[key].value += value;
        groupedData[key].count += 1;
      }
    });

    // Convert to array format for charts
    return Object.entries(groupedData).map(([key, data]) => ({
      date: key,
      value: data.value / data.count,
      count: data.count,
    }));
  },
});

// Update vitals record
export const updateVitals = mutation({
  args: {
    id: v.id("vitals"),
    heartRate: v.optional(v.number()),
    spO2: v.optional(v.number()),
    temperature: v.optional(v.number()),
    bmi: v.optional(v.number()),
    deviceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Delete vitals record
export const deleteVitals = mutation({
  args: { id: v.id("vitals") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Get vitals for multiple patients (admin function)
export const getAllVitals = query({
  args: {
    limit: v.optional(v.number()),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;
    const days = args.days || 7;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    let vitals = await ctx.db.query("vitals").collect();

    // Filter by date range
    vitals = vitals.filter((vital) => {
      const vitalDate = new Date(vital._creationTime);
      return vitalDate >= cutoffDate;
    });

    // Sort by creation time (newest first) and apply limit
    vitals.sort((a, b) => b._creationTime - a._creationTime);
    return vitals.slice(0, limit);
  },
});

// Get vitals alerts (for abnormal values)
export const getVitalsAlerts = query({
  args: { 
    patientId: v.optional(v.string()),
    severity: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
  },
  handler: async (ctx, args) => {
    let vitals = await ctx.db.query("vitals").collect();

    // Filter by patient if specified
    if (args.patientId) {
      vitals = vitals.filter((vital) => vital.patientId === args.patientId);
    }

    // Get latest vitals for each patient
    const latestVitals = new Map<string, any>();
    vitals.forEach((vital) => {
      const existing = latestVitals.get(vital.patientId);
      if (!existing || vital._creationTime > existing._creationTime) {
        latestVitals.set(vital.patientId, vital);
      }
    });

    // Check for abnormal values
    const alerts: Array<{
      patientId: string;
      metric: string;
      value: number;
      normalRange: { min: number; max: number };
      severity: "low" | "medium" | "high";
    }> = [];

    latestVitals.forEach((vital) => {
      // Heart rate alerts (normal: 60-100 bpm)
      if (vital.heartRate !== undefined) {
        if (vital.heartRate < 60 || vital.heartRate > 100) {
          const severity = vital.heartRate < 50 || vital.heartRate > 110 ? "high" : 
                          vital.heartRate < 55 || vital.heartRate > 105 ? "medium" : "low";
          
          if (!args.severity || args.severity === severity) {
            alerts.push({
              patientId: vital.patientId,
              metric: "heartRate",
              value: vital.heartRate,
              normalRange: { min: 60, max: 100 },
              severity,
            });
          }
        }
      }

      // SpO2 alerts (normal: 95-100%)
      if (vital.spO2 !== undefined) {
        if (vital.spO2 < 95) {
          const severity = vital.spO2 < 90 ? "high" : 
                          vital.spO2 < 92 ? "medium" : "low";
          
          if (!args.severity || args.severity === severity) {
            alerts.push({
              patientId: vital.patientId,
              metric: "spO2",
              value: vital.spO2,
              normalRange: { min: 95, max: 100 },
              severity,
            });
          }
        }
      }

      // Temperature alerts (normal: 97-99°F)
      if (vital.temperature !== undefined) {
        if (vital.temperature < 97 || vital.temperature > 99) {
          const severity = vital.temperature < 95 || vital.temperature > 101 ? "high" : 
                          vital.temperature < 96 || vital.temperature > 100 ? "medium" : "low";
          
          if (!args.severity || args.severity === severity) {
            alerts.push({
              patientId: vital.patientId,
              metric: "temperature",
              value: vital.temperature,
              normalRange: { min: 97, max: 99 },
              severity,
            });
          }
        }
      }
    });

    // Sort by severity (high first) and then by value deviation
    alerts.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      
      // Calculate deviation from normal range
      const aDeviation = Math.min(
        Math.abs(a.value - a.normalRange.min),
        Math.abs(a.value - a.normalRange.max)
      );
      const bDeviation = Math.min(
        Math.abs(b.value - b.normalRange.min),
        Math.abs(b.value - b.normalRange.max)
      );
      
      return bDeviation - aDeviation;
    });

    return alerts;
  },
});