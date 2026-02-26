import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addMember = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.isGroup) {
      throw new Error("Not a group conversation");
    }

    if (conversation.participants.includes(args.userId)) {
      return;
    }

    await ctx.db.patch(args.conversationId, {
      participants: [...conversation.participants, args.userId],
    });
  },
});

export const removeMember = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.isGroup) {
      throw new Error("Not a group conversation");
    }

    await ctx.db.patch(args.conversationId, {
      participants: conversation.participants.filter((id) => id !== args.userId),
    });
  },
});

export const updateGroupName = mutation({
  args: {
    conversationId: v.id("conversations"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || !conversation.isGroup) {
      throw new Error("Not a group conversation");
    }

    await ctx.db.patch(args.conversationId, {
      name: args.name,
    });
  },
});

export const getGroupMembers = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return [];

    const members = await Promise.all(
      conversation.participants.map((id) => ctx.db.get(id))
    );

    return members.filter((m) => m !== null);
  },
});
