import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOrCreate = mutation({
  args: {
    currentUserId: v.id("users"),
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if conversation already exists
    const existing = await ctx.db
      .query("conversations")
      .filter((q) =>
        q.and(
          q.eq(q.field("isGroup"), false),
          q.or(
            q.eq(q.field("participants"), [args.currentUserId, args.otherUserId]),
            q.eq(q.field("participants"), [args.otherUserId, args.currentUserId])
          )
        )
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("conversations", {
      isGroup: false,
      createdBy: args.currentUserId,
      participants: [args.currentUserId, args.otherUserId],
      lastMessageAt: Date.now(),
    });
  },
});

export const createGroup = mutation({
  args: {
    name: v.string(),
    participants: v.array(v.id("users")),
    createdBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      isGroup: true,
      name: args.name,
      participants: args.participants,
      createdBy: args.createdBy,
      lastMessageAt: Date.now(),
    });
  },
});

export const getById = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const getConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .collect();

    const userConversations = conversations.filter((conv) =>
      conv.participants.includes(args.userId)
    );

    return userConversations.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  },
});

export const updateLastMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    lastMessage: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
      lastMessage: args.lastMessage,
    });
  },
});

export const getConversationParticipants = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return [];

    const participants = await Promise.all(
      conversation.participants.map((id) => ctx.db.get(id))
    );

    return participants.filter((p) => p !== null);
  },
});
