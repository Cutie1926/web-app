import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(), // encrypted content
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      isDeleted: false,
      createdAt: Date.now(),
    });

    // Update conversation's last message
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
      lastMessage: "[Message]", // Don't store decrypted content
    });

    // Reset unread count for sender
    const unreadKey = await ctx.db
      .query("unreadMessages")
      .filter((q) =>
        q.and(
          q.eq(q.field("conversationId"), args.conversationId),
          q.eq(q.field("userId"), args.senderId)
        )
      )
      .first();

    if (unreadKey) {
      await ctx.db.patch(unreadKey._id, { count: 0, lastReadAt: Date.now() });
    }

    // Increment unread count for all recipients.
    await Promise.all(
      conversation.participants
        .filter((participantId) => participantId !== args.senderId)
        .map(async (participantId) => {
          const existingUnread = await ctx.db
            .query("unreadMessages")
            .withIndex("by_userId_conversationId", (q) =>
              q.eq("userId", participantId).eq("conversationId", args.conversationId)
            )
            .first();

          if (existingUnread) {
            await ctx.db.patch(existingUnread._id, {
              count: existingUnread.count + 1,
            });
            return;
          }

          await ctx.db.insert("unreadMessages", {
            conversationId: args.conversationId,
            userId: participantId,
            count: 1,
            lastReadAt: Date.now(),
          });
        })
    );

    return messageId;
  },
});

export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(limit);

    // Get sender info for each message
    const messagesWithSender = await Promise.all(
      messages.reverse().map(async (msg) => {
        const sender = await ctx.db.get(msg.senderId);
        return {
          ...msg,
          sender,
        };
      })
    );

    return messagesWithSender;
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      content: "[Message deleted]",
      updatedAt: Date.now(),
    });
  },
});

export const getMessage = query({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) return null;

    const sender = await ctx.db.get(message.senderId);
    return {
      ...message,
      sender,
    };
  },
});

export const getConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .order("desc")
      .take(args.limit || 50);

    return messages
      .reverse()
      .map((msg) => ({
        ...msg,
      }));
  },
});
