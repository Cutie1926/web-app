import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("unreadMessages")
      .filter((q) =>
        q.and(
          q.eq(q.field("conversationId"), args.conversationId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        count: 0,
        lastReadAt: Date.now(),
      });
    } else {
      await ctx.db.insert("unreadMessages", {
        conversationId: args.conversationId,
        userId: args.userId,
        count: 0,
        lastReadAt: Date.now(),
      });
    }
  },
});

export const incrementUnreadCount = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("unreadMessages")
      .filter((q) =>
        q.and(
          q.eq(q.field("conversationId"), args.conversationId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
      });
    } else {
      await ctx.db.insert("unreadMessages", {
        conversationId: args.conversationId,
        userId: args.userId,
        count: 1,
        lastReadAt: Date.now(),
      });
    }
  },
});

export const getUnreadCount = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("unreadMessages")
      .filter((q) =>
        q.and(
          q.eq(q.field("conversationId"), args.conversationId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .first();

    return unread?.count || 0;
  },
});

export const getTotalUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("unreadMessages")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    return unread.reduce((total, item) => total + item.count, 0);
  },
});
