"use client";

import React, { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { ReactionBar } from "./ReactionBar";
import { DeleteMessageButton } from "./DeleteMessageButton";
import { formatMessageTime } from "@/lib/dateFormatter";
import { useEncryption } from "@/hooks/useEncryption";

interface MessageItemProps {
  message: {
    _id: string;
    senderId: string;
    content: string;
    isDeleted: boolean;
    createdAt: number;
  };
  sender?: {
    name: string;
    avatarUrl?: string;
  };
  currentUserId: string | null;
  reactions?: Record<string, string[]>;
  onReactionChange?: () => void;
  onMessageDelete?: () => void;
  isGroup?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  sender,
  currentUserId,
  reactions,
  onReactionChange,
  onMessageDelete,
  isGroup,
}) => {
  const { decrypt } = useEncryption();
  const [isHovering, setIsHovering] = useState(false);

  const isCurrentUserMessage = currentUserId === message.senderId;
  const decryptedContent = message.isDeleted ? message.content : decrypt(message.content);

  return (
    <div
      className={`flex gap-3 mb-4 group ${isCurrentUserMessage ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {!isCurrentUserMessage && (
        <Avatar
          name={sender?.name || "Unknown"}
          imageUrl={sender?.avatarUrl}
          size="sm"
        />
      )}

      <div
        className={`flex flex-col gap-1 max-w-xs lg:max-w-md ${
          isCurrentUserMessage ? "items-end" : "items-start"
        }`}
      >
        {isGroup && !isCurrentUserMessage && (
          <p className="text-xs text-slate-700 font-semibold">{sender?.name || "Unknown"}</p>
        )}

        <div
          className={`px-4 py-2 rounded-2xl break-words shadow-sm ${
            isCurrentUserMessage
              ? "bg-blue-700 text-white"
              : "bg-slate-200 text-slate-900 border border-slate-300"
          } ${message.isDeleted ? "italic text-slate-500" : ""}`}
        >
          {decryptedContent}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span>{formatMessageTime(message.createdAt)}</span>
          {isHovering && (
            <DeleteMessageButton
              messageId={message._id}
              senderId={message.senderId}
              currentUserId={currentUserId}
              onDelete={onMessageDelete}
            />
          )}
        </div>

        {!message.isDeleted && (
          <div className="mt-2">
            <ReactionBar
              messageId={message._id}
              userId={currentUserId}
              reactions={reactions}
              onReactionChange={onReactionChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};
