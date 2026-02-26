"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Message {
  _id: string;
  content: string;
  sender?: { _id?: string; name: string } | null;
}

export const useAutoScroll = (messages: Message[]) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showNewMessagesButton, setShowNewMessagesButton] = useState(false);
  const [isUserScrolled, setIsUserScrolled] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowNewMessagesButton(false);
    setIsUserScrolled(false);
  }, []);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    setIsUserScrolled(!isNearBottom);

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // If user is not near bottom and new messages exist, show button
    if (!isNearBottom && messages.length > 0) {
      setShowNewMessagesButton(true);
    } else {
      setShowNewMessagesButton(false);
    }
  }, [messages.length]);

  useEffect(() => {
    // Auto-scroll only if user hasn't manually scrolled up
    if (!isUserScrolled && messages.length > 0) {
      // Use a slight delay to ensure DOM is updated
      scrollTimeoutRef.current = setTimeout(() => {
        scrollToBottom();
      }, 50);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages.length, isUserScrolled, scrollToBottom]);

  return {
    messagesEndRef,
    messagesContainerRef,
    showNewMessagesButton,
    scrollToBottom,
    handleScroll,
  };
};
