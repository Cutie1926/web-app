import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if reaction already exists
    const existing = await ctx.db
      .query("reactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("messageId"), args.messageId),
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("emoji"), args.emoji)
        )
      )
      .first();

    if (existing) {
      // Remove reaction if it already exists
      await ctx.db.delete(existing._id);
      return null;
    }

    // Remove any other reaction from this user on this message
    const otherReaction = await ctx.db
      .query("reactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("messageId"), args.messageId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .first();

    if (otherReaction) {
      await ctx.db.delete(otherReaction._id);
    }

    return await ctx.db.insert("reactions", {
      messageId: args.messageId,
      userId: args.userId,
      emoji: args.emoji,
    });
  },
});

export const removeReaction = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const reaction = await ctx.db
      .query("reactions")
      .filter((q) =>
        q.and(
          q.eq(q.field("messageId"), args.messageId),
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("emoji"), args.emoji)
        )
      )
      .first();

    if (reaction) {
      await ctx.db.delete(reaction._id);
    }
  },
});

export const getMessageReactions = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_messageId", (q) => q.eq("messageId", args.messageId))
      .collect();

    const grouped = new Map<string, string[]>();
    for (const reaction of reactions) {
      const userIds = grouped.get(reaction.emoji) || [];
      userIds.push(reaction.userId);
      grouped.set(reaction.emoji, userIds);
    }

    return Array.from(grouped.entries()).map(([emoji, userIds]) => ({
      emoji,
      userIds,
    }));
  },
});

export const getReactionsForMessages = query({
  args: { messageIds: v.array(v.id("messages")) },
  handler: async (ctx, args) => {
    return await Promise.all(
      args.messageIds.map(async (messageId) => {
        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_messageId", (q) => q.eq("messageId", messageId))
          .collect();

        const grouped = new Map<string, string[]>();
        for (const reaction of reactions) {
          const userIds = grouped.get(reaction.emoji) || [];
          userIds.push(reaction.userId);
          grouped.set(reaction.emoji, userIds);
        }

        return {
          messageId,
          reactions: Array.from(grouped.entries()).map(([emoji, userIds]) => ({
            emoji,
            userIds,
          })),
        };
      })
    );
  },
});
