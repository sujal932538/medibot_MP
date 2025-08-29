import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new chat session
export const createChatSession = mutation({
  args: {
    patientId: v.string(),
    sessionStart: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatSessions", {
      ...args,
      status: "active",
    });
  },
});

// Get chat session by ID
export const getChatSessionById = query({
  args: { id: v.id("chatSessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get active chat sessions for a patient
export const getActiveChatSessions = query({
  args: { patientId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatSessions")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();
  },
});

// Get all chat sessions for a patient
export const getPatientChatSessions = query({
  args: { 
    patientId: v.string(),
    limit: v.optional(v.number()),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    let sessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();

    // Filter by status if specified
    if (args.status) {
      sessions = sessions.filter((session) => session.status === args.status);
    }

    // Sort by session start (newest first)
    sessions.sort((a, b) => new Date(b.sessionStart).getTime() - new Date(a.sessionStart).getTime());

    // Apply limit if specified
    if (args.limit) {
      sessions = sessions.slice(0, args.limit);
    }

    return sessions;
  },
});

// Update chat session status
export const updateChatSessionStatus = mutation({
  args: {
    id: v.id("chatSessions"),
    status: v.union(v.literal("active"), v.literal("completed")),
    sessionEnd: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = { status: args.status };
    if (args.sessionEnd) {
      updates.sessionEnd = args.sessionEnd;
    }
    return await ctx.db.patch(args.id, updates);
  },
});

// End a chat session
export const endChatSession = mutation({
  args: { id: v.id("chatSessions") },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      status: "completed",
      sessionEnd: new Date().toISOString(),
    });
  },
});

// Delete chat session
export const deleteChatSession = mutation({
  args: { id: v.id("chatSessions") },
  handler: async (ctx, args) => {
    // First delete all messages in the session
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.id))
      .collect();

    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    // Then delete the session
    return await ctx.db.delete(args.id);
  },
});

// Save a new chat message
export const saveChatMessage = mutation({
  args: {
    sessionId: v.id("chatSessions"),
    message: v.string(),
    sender: v.union(v.literal("user"), v.literal("bot")),
    severity: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    appointmentSuggested: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("chatMessages", args);
  },
});

// Get messages for a specific chat session
export const getChatMessages = query({
  args: { 
    sessionId: v.id("chatSessions"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const offset = args.offset || 0;

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Sort by creation time (oldest first for chat)
    messages.sort((a, b) => a._creationTime - b._creationTime);

    // Apply pagination
    return messages.slice(offset, offset + limit);
  },
});

// Get recent messages for a session (for real-time updates)
export const getRecentMessages = query({
  args: { 
    sessionId: v.id("chatSessions"),
    since: v.number(), // timestamp
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Filter messages created after the specified timestamp
    return messages
      .filter((message) => message._creationTime > args.since)
      .sort((a, b) => a._creationTime - b._creationTime);
  },
});

// Get chat statistics for a patient
export const getChatStats = query({
  args: { 
    patientId: v.string(),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const sessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();

    // Filter by date range
    const recentSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.sessionStart);
      return sessionDate >= cutoffDate;
    });

    // Get all messages for these sessions
    const sessionIds = recentSessions.map((session) => session._id);
    const allMessages = await ctx.db.query("chatMessages").collect();
    const recentMessages = allMessages.filter((message) => 
      sessionIds.includes(message.sessionId)
    );

    // Calculate statistics
    const totalSessions = recentSessions.length;
    const activeSessions = recentSessions.filter((session) => session.status === "active").length;
    const completedSessions = recentSessions.filter((session) => session.status === "completed").length;
    
    const userMessages = recentMessages.filter((message) => message.sender === "user").length;
    const botMessages = recentMessages.filter((message) => message.sender === "bot").length;
    const totalMessages = recentMessages.length;
    
    const appointmentSuggestions = recentMessages.filter((message) => message.appointmentSuggested).length;
    
    const severityCounts = recentMessages.reduce((acc, message) => {
      if (message.severity) {
        acc[message.severity] = (acc[message.severity] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSessions,
      activeSessions,
      completedSessions,
      totalMessages,
      userMessages,
      botMessages,
      appointmentSuggestions,
      severityCounts,
      averageMessagesPerSession: totalSessions > 0 ? totalMessages / totalSessions : 0,
      averageSessionDuration: calculateAverageSessionDuration(recentSessions),
    };
  },
});

// Helper function to calculate average session duration
function calculateAverageSessionDuration(sessions: any[]): number {
  const completedSessions = sessions.filter((session) => session.sessionEnd);
  
  if (completedSessions.length === 0) return 0;

  const totalDuration = completedSessions.reduce((total, session) => {
    const start = new Date(session.sessionStart).getTime();
    const end = new Date(session.sessionEnd).getTime();
    return total + (end - start);
  }, 0);

  return totalDuration / completedSessions.length;
}

// Get chat insights for AI analysis
export const getChatInsights = query({
  args: { 
    sessionId: v.id("chatSessions"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    // Sort by creation time
    messages.sort((a, b) => a._creationTime - b._creationTime);

    // Analyze conversation flow
    const userMessages = messages.filter((m) => m.sender === "user");
    const botMessages = messages.filter((m) => m.sender === "bot");
    
    // Calculate response times
    const responseTimes: number[] = [];
    for (let i = 0; i < userMessages.length && i < botMessages.length; i++) {
      const userTime = userMessages[i]._creationTime;
      const botTime = botMessages[i]._creationTime;
      if (botTime > userTime) {
        responseTimes.push(botTime - userTime);
      }
    }

    // Get severity trends
    const severityTrend = messages
      .filter((m) => m.severity)
      .map((m) => ({
        timestamp: m._creationTime,
        severity: m.severity,
        message: m.message,
      }));

    // Get appointment suggestion context
    const appointmentContext = messages
      .filter((m) => m.appointmentSuggested)
      .map((m) => ({
        timestamp: m._creationTime,
        message: m.message,
        previousUserMessage: messages
          .filter((msg) => msg.sender === "user" && msg._creationTime < m._creationTime)
          .pop()?.message || "",
      }));

    return {
      totalMessages: messages.length,
      userMessageCount: userMessages.length,
      botMessageCount: botMessages.length,
      averageResponseTime: responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0,
      severityTrend,
      appointmentContext,
      conversationDuration: messages.length > 0 
        ? messages[messages.length - 1]._creationTime - messages[0]._creationTime 
        : 0,
      messageFrequency: messages.length > 0 
        ? messages.length / (messages.length > 1 
          ? (messages[messages.length - 1]._creationTime - messages[0]._creationTime) / 1000 / 60 
          : 1)
        : 0,
    };
  },
});

// Search chat messages
export const searchChatMessages = query({
  args: { 
    patientId: v.string(),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const searchQuery = args.query.toLowerCase();

    // Get all sessions for the patient
    const sessions = await ctx.db
      .query("chatSessions")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .collect();

    const sessionIds = sessions.map((session) => session._id);
    
    // Get all messages for these sessions
    const allMessages = await ctx.db.query("chatMessages").collect();
    const patientMessages = allMessages.filter((message) => 
      sessionIds.includes(message.sessionId)
    );

    // Search in messages
    const searchResults = patientMessages
      .filter((message) => 
        message.message.toLowerCase().includes(searchQuery)
      )
      .map((message) => ({
        ...message,
        sessionStart: sessions.find((s) => s._id === message.sessionId)?.sessionStart,
        sessionStatus: sessions.find((s) => s._id === message.sessionId)?.status,
      }))
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, limit);

    return searchResults;
  },
});

// Get chat analytics for admin dashboard
export const getChatAnalytics = query({
  args: { 
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const sessions = await ctx.db.query("chatSessions").collect();
    const messages = await ctx.db.query("chatMessages").collect();

    // Filter by date range
    const recentSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.sessionStart);
      return sessionDate >= cutoffDate;
    });

    const recentMessages = messages.filter((message) => {
      const messageDate = new Date(message._creationTime);
      return messageDate >= cutoffDate;
    });

    // Group by day for time series data
    const dailyStats: Record<string, {
      sessions: number;
      messages: number;
      userMessages: number;
      botMessages: number;
    }> = {};

    recentSessions.forEach((session) => {
      const date = new Date(session.sessionStart).toISOString().slice(0, 10);
      if (!dailyStats[date]) {
        dailyStats[date] = { sessions: 0, messages: 0, userMessages: 0, botMessages: 0 };
      }
      dailyStats[date].sessions++;
    });

    recentMessages.forEach((message) => {
      const date = new Date(message._creationTime).toISOString().slice(0, 10);
      if (!dailyStats[date]) {
        dailyStats[date] = { sessions: 0, messages: 0, userMessages: 0, botMessages: 0 };
      }
      dailyStats[date].messages++;
      if (message.sender === "user") {
        dailyStats[date].userMessages++;
      } else {
        dailyStats[date].botMessages++;
      }
    });

    // Convert to array format for charts
    const timeSeriesData = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        ...stats,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalSessions: recentSessions.length,
      totalMessages: recentMessages.length,
      averageSessionDuration: calculateAverageSessionDuration(recentSessions),
      averageMessagesPerSession: recentSessions.length > 0 
        ? recentMessages.length / recentSessions.length 
        : 0,
      timeSeriesData,
      topSymptomKeywords: extractTopKeywords(recentMessages),
    };
  },
});

// Helper function to extract top keywords from messages
function extractTopKeywords(messages: any[]): Array<{ keyword: string; count: number }> {
  const keywordCounts: Record<string, number> = {};
  const commonSymptoms = [
    "headache", "fever", "cough", "pain", "nausea", "dizziness", "fatigue",
    "chest pain", "shortness of breath", "abdominal pain", "vomiting", "diarrhea"
  ];

  messages.forEach((message) => {
    const text = message.message.toLowerCase();
    commonSymptoms.forEach((symptom) => {
      if (text.includes(symptom)) {
        keywordCounts[symptom] = (keywordCounts[symptom] || 0) + 1;
      }
    });
  });

  return Object.entries(keywordCounts)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}
