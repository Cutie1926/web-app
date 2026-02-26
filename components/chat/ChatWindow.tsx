"use client";

import React from "react";
import { useQuery } from "convex/react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Avatar } from "@/components/ui/Avatar";
import { OnlineStatus } from "./OnlineStatus";
import { formatGroupTitle } from "@/lib/dateFormatter";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string | null;
  conversationName?: string;
  isGroup?: boolean;
  participantCount?: number;
  participants?: Array<{ _id: string; name: string; avatarUrl?: string; isOnline: boolean }>;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationId,
  currentUserId,
  conversationName,
  isGroup,
  participantCount,
  participants = [],
}) => {
  const typingUsers = useQuery(
    api.typing.getTypingUsers,
    conversationId ? { conversationId: conversationId as Id<"conversations"> } : "skip"
  );

  const groupMembers = useQuery(
    api.groups.getGroupMembers,
    isGroup && conversationId
      ? { conversationId: conversationId as Id<"conversations"> }
      : "skip"
  );

  const displayName = isGroup
    ? formatGroupTitle(isGroup, conversationName, groupMembers?.length || participantCount)
    : conversationName;

  // Get the other participant for DM
  const otherParticipant =
    !isGroup && participants.length > 0
      ? participants.find((p) => p._id !== currentUserId)
      : null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="border-b border-slate-300 px-6 py-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-4">
          {isGroup ? (
            <div className="flex -space-x-2">
              {groupMembers?.slice(0, 3).map((member) => (
                <Avatar
                  key={member._id}
                  name={member.name}
                  imageUrl={member.avatarUrl}
                  size="sm"
                />
              ))}
            </div>
          ) : (
            otherParticipant && (
              <Avatar
                name={otherParticipant.name}
                imageUrl={otherParticipant.avatarUrl}
                size="md"
                showStatus
                isOnline={otherParticipant.isOnline}
              />
            )
          )}

          <div>
            <h2 className="font-semibold text-slate-900">{displayName}</h2>
            {!isGroup && otherParticipant && (
              <p className="text-xs text-slate-600">
                <OnlineStatus isOnline={otherParticipant.isOnline} lastSeen={0} />
              </p>
            )}
            {isGroup && groupMembers && (
              <p className="text-xs text-slate-600">
                {groupMembers.length} members
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        conversationId={conversationId}
        currentUserId={currentUserId}
        typingUsers={typingUsers || []}
        isGroup={isGroup}
      />

      {/* Input */}
      <MessageInput
        conversationId={conversationId}
        userId={currentUserId}
      />
    </div>
  );
};
