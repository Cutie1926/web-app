import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 2 second timeout for typing indicator
const TYPING_TIMEOUT = 2000;

export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Remove expired typing indicators
    const allTyping = await ctx.db.query("typingIndicators").collect();
    const now = Date.now();

    for (const indicator of allTyping) {
      if (indicator.expiresAt < now) {
        await ctx.db.delete(indicator._id);
      }
    }

    // Check if user already has a typing indicator in this conversation
    const existing = await ctx.db
      .query("typingIndicators")
      .filter((q) =>
        q.and(
          q.eq(q.field("conversationId"), args.conversationId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        expiresAt: now + TYPING_TIMEOUT,
      });
    } else {
      await ctx.db.insert("typingIndicators", {
        conversationId: args.conversationId,
        userId: args.userId,
        expiresAt: now + TYPING_TIMEOUT,
      });
    }
  },
});

export const clearTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const indicator = await ctx.db
      .query("typingIndicators")
      .filter((q) =>
        q.and(
          q.eq(q.field("conversationId"), args.conversationId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .first();

    if (indicator) {
      await ctx.db.delete(indicator._id);
    }
  },
});

export const getTypingUsers = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const typing = await ctx.db
      .query("typingIndicators")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const now = Date.now();
    const activeTyping = typing.filter((t) => t.expiresAt > now);

    // Get user info for typing indicators
    const typingUsers = await Promise.all(
      activeTyping.map(async (t) => {
        const user = await ctx.db.get(t.userId);
        return user;
      })
    );

    return typingUsers.filter((u) => u !== null);
  },
});
