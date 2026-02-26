"use client";

import React from "react";
import { useQuery } from "convex/react";
import { Avatar } from "@/components/ui/Avatar";
import { formatConversationDate } from "@/lib/dateFormatter";
import { shortenText } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface ConversationItemProps {
  userId?: string | null;
  conversation: {
    _id: string;
    isGroup: boolean;
    name?: string;
    participants: string[];
    lastMessageAt: number;
    lastMessage?: string;
  };
  isActive?: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  userId,
  conversation,
  isActive,
  onClick,
}) => {
  const participants = useQuery(
    api.conversations.getConversationParticipants,
    { conversationId: conversation._id as Id<"conversations"> }
  );

  const unreadCount = useQuery(
    api.unreadMessages.getUnreadCount,
    userId ? { userId: userId as Id<"users">, conversationId: conversation._id as Id<"conversations"> } : "skip"
  );

  if (!participants) {
    return null;
  }

  // Get conversation display name and avatar
  let displayName = "";
  let avatarName = "";
  let avatarUrl = "";

  if (conversation.isGroup) {
    displayName = conversation.name || "Group";
    avatarName = displayName;
  } else {
    const otherParticipant = participants.find(
      (p) => p._id !== userId
    );
    displayName = otherParticipant?.name || "Unknown";
    avatarName = displayName;
    avatarUrl = otherParticipant?.avatarUrl || "";
  }

  const lastMessagePreview = conversation.lastMessage
    ? shortenText(conversation.lastMessage, 40)
    : "No messages yet";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-colors border border-transparent ${
        isActive
          ? "bg-blue-100 border-blue-300"
          : "hover:bg-slate-100"
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar
          name={avatarName}
          imageUrl={avatarUrl}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900 truncate">{displayName}</h3>
            <span className="text-xs text-slate-600 whitespace-nowrap">
              {formatConversationDate(conversation.lastMessageAt)}
            </span>
          </div>

          <p className="text-sm text-slate-700 truncate">{lastMessagePreview}</p>

          {unreadCount && unreadCount > 0 && (
            <div className="mt-1 inline-block">
              <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5 font-medium">
                {unreadCount} new
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};
