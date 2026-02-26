"use client";

import React, { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTyping } from "@/hooks/useTyping";
import { useEncryption } from "@/hooks/useEncryption";
import { Send } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface MessageInputProps {
  conversationId: string;
  userId: string | null;
  onMessageSent?: () => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  userId,
  onMessageSent,
  disabled,
}) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useMutation(api.messages.send);

  const updateLastMessage = useMutation(api.conversations.updateLastMessage);

  const { startTyping, stopTyping } = useTyping(conversationId, userId);
  const { encrypt } = useEncryption();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (e.target.value.trim()) {
      startTyping();
    }
  };

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const trimmedMessage = message.trim();
      if (!trimmedMessage || !conversationId || !userId) return;

      try {
        setIsLoading(true);
        stopTyping();

        // Encrypt the message before sending
        const encryptedContent = encrypt(trimmedMessage);

        await sendMessage({
          conversationId: conversationId as Id<"conversations">,
          senderId: userId as Id<"users">,
          content: encryptedContent,
        });

        // Update conversation's last message
        await updateLastMessage({
          conversationId: conversationId as Id<"conversations">,
          lastMessage: "[Message]",
        });

        setMessage("");
        onMessageSent?.();
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      message,
      conversationId,
      userId,
      encrypt,
      sendMessage,
      updateLastMessage,
      stopTyping,
      onMessageSent,
    ]
  );

  return (
    <form onSubmit={handleSendMessage} className="flex gap-2 p-4 border-t">
      <Input
        value={message}
        onChange={handleChange}
        placeholder="Type a message..."
        disabled={disabled || !conversationId}
        className="flex-1 bg-white text-gray-900 placeholder:text-gray-500"
      />
      <Button
        type="submit"
        disabled={!message.trim() || isLoading || disabled || !conversationId}
        size="md"
        isLoading={isLoading}
      >
        <Send size={20} />
      </Button>
    </form>
  );
};
