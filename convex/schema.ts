import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

  conversations: defineTable({
    isGroup: v.boolean(),
    name: v.optional(v.string()), // for group chats
    createdBy: v.id("users"),
    participants: v.array(v.id("users")),
    lastMessageAt: v.number(),
    lastMessage: v.optional(v.string()),
  })
    .index("by_participants", ["participants"])
    .index("by_lastMessageAt", ["lastMessageAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(), // encrypted content
    isDeleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_createdAt", ["createdAt"]),

  reactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  })
    .index("by_messageId", ["messageId"])
    .index("by_userId_messageId", ["userId", "messageId"]),

  typingIndicators: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    expiresAt: v.number(),
  })
    .index("by_conversationId", ["conversationId"]),

  presence: defineTable({
    userId: v.id("users"),
    conversationId: v.optional(v.id("conversations")),
    lastHeartbeat: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_conversationId", ["conversationId"]),

  unreadMessages: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    count: v.number(),
    lastReadAt: v.number(),
  })
    .index("by_userId_conversationId", ["userId", "conversationId"]),
});
