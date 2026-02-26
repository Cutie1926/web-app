import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const HEARTBEAT_TIMEOUT = 30000; // 30 seconds

export const updateHeartbeat = mutation({
  args: {
    userId: v.id("users"),
    conversationId: v.optional(v.id("conversations")),
  },
  handler: async (ctx, args) => {
    // Check if presence record exists
    const existing = await ctx.db
      .query("presence")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        conversationId: args.conversationId,
        lastHeartbeat: now,
      });
    } else {
      await ctx.db.insert("presence", {
        userId: args.userId,
        conversationId: args.conversationId,
        lastHeartbeat: now,
      });
    }

    // Update user's online status
    await ctx.db.patch(args.userId, {
      isOnline: true,
      lastSeen: now,
    });
  },
});

export const getUserPresence = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    return {
      userId: args.userId,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
    };
  },
});

export const getConversationPresence = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const presences = await ctx.db
      .query("presence")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const now = Date.now();
    const activeUsers = presences
      .filter((p) => now - p.lastHeartbeat < HEARTBEAT_TIMEOUT)
      .map((p) => p.userId);

    return activeUsers;
  },
});

export const goOffline = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isOnline: false,
      lastSeen: Date.now(),
    });

    const presence = await ctx.db
      .query("presence")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (presence) {
      await ctx.db.delete(presence._id);
    }
  },
});
