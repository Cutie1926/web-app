"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Id } from "@/convex/_generated/dataModel";

export const useTyping = (conversationId: string | null, userId: string | null) => {
  const setTyping = useMutation(api.typing.setTyping);
  const clearTyping = useMutation(api.typing.clearTyping);

  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const startTyping = useCallback(() => {
    if (!conversationId || !userId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing
    setTyping({ 
      conversationId: conversationId as Id<"conversations">, 
      userId: userId as Id<"users"> 
    });

    // Auto-clear after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (conversationId && userId) {
        clearTyping({ 
          conversationId: conversationId as Id<"conversations">, 
          userId: userId as Id<"users"> 
        });
      }
    }, 2000);
  }, [conversationId, userId, setTyping, clearTyping]);

  const stopTyping = useCallback(() => {
    if (!conversationId || !userId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    clearTyping({ 
      conversationId: conversationId as Id<"conversations">, 
      userId: userId as Id<"users"> 
    });
  }, [conversationId, userId, clearTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return { startTyping, stopTyping };
};
