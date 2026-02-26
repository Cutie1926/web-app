"use client";

import React from "react";
import { useQuery } from "convex/react";
import { MessageItem } from "./MessageItem";
import { TypingIndicator } from "./TypingIndicator";
import { MessageSkeleton } from "@/components/loaders";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

type MessageWithSender = Doc<"messages"> & { sender: Doc<"users"> | null };
type MessageReactionRow = {
  messageId: Id<"messages">;
  reactions: Array<{ emoji: string; userIds: string[] }>;
};

interface MessageListProps {
  conversationId: string;
  currentUserId: string | null;
  typingUsers?: Array<{ name: string }>;
  isGroup?: boolean;
  onMessageCountChange?: (count: number) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  conversationId,
  currentUserId,
  typingUsers = [],
  isGroup,
  onMessageCountChange,
}) => {

  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId: conversationId as Id<"conversations">, limit: 50 } : "skip"
  );

  const reactionsMap = useQuery(
    api.reactions.getReactionsForMessages,
    messages?.length
      ? { messageIds: messages.map((msg) => msg._id as Id<"messages">) }
      : "skip"
  );

  const normalizedReactions = React.useMemo(() => {
    const map: Record<string, Record<string, string[]>> = {};
    const rows = (reactionsMap || []) as MessageReactionRow[];

    for (const row of rows) {
      map[row.messageId] = {};
      for (const reaction of row.reactions) {
        map[row.messageId][reaction.emoji] = reaction.userIds || [];
      }
    }

    return map;
  }, [reactionsMap]);

  const typedMessages = (messages || []) as MessageWithSender[];

  const {
    messagesEndRef,
    messagesContainerRef,
    showNewMessagesButton,
    scrollToBottom,
    handleScroll,
  } = useAutoScroll(
    typedMessages.map((msg) => ({ _id: msg._id, content: msg.content, sender: msg.sender }))
  );

  React.useEffect(() => {
    if (messages) {
      onMessageCountChange?.(messages.length);
    }
  }, [messages, onMessageCountChange]);

  if (!messages) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {[...Array(5)].map((_, i) => (
          <MessageSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-700 text-lg">No messages yet</p>
          <p className="text-slate-500 text-sm">Start a conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/40"
    >
      {typedMessages.map((message) => {
        const messageReactions = normalizedReactions[message._id] || {};

        return (
          <MessageItem
            key={message._id}
            message={message}
            sender={message.sender ?? undefined}
            currentUserId={currentUserId}
            reactions={messageReactions}
            isGroup={isGroup}
          />
        );
      })}

      <TypingIndicator users={typingUsers} />

      {showNewMessagesButton && (
        <div className="flex justify-center py-4">
          <button
            onClick={scrollToBottom}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ↓ New Messages
          </button>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
