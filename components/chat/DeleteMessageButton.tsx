"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface DeleteMessageButtonProps {
  messageId: string;
  senderId: string;
  currentUserId: string | null;
  onDelete?: () => void;
}

export const DeleteMessageButton: React.FC<DeleteMessageButtonProps> = ({
  messageId,
  senderId,
  currentUserId,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteMessage = useMutation(api.messages.deleteMessage);

  // Only show delete button if current user is the message sender
  if (!currentUserId || currentUserId !== senderId) {
    return null;
  }

  const handleDelete = async () => {
    if (!messageId) return;

    try {
      setIsDeleting(true);
      await deleteMessage({ messageId: messageId as Id<"messages"> });
      onDelete?.();
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-gray-500 hover:text-red-600 transition-colors p-1"
      title="Delete message"
    >
      <Trash2 size={16} />
    </button>
  );
};
