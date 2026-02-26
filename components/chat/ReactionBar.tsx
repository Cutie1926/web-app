"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

interface ReactionBarProps {
  messageId: string;
  userId: string | null;
  reactions?: Record<string, string[]>;
  onReactionChange?: () => void;
}

export const ReactionBar: React.FC<ReactionBarProps> = ({
  messageId,
  userId,
  reactions = {},
  onReactionChange,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const addReaction = useMutation(api.reactions.addReaction);

  const handleReaction = async (emoji: string) => {
    if (!userId || !messageId) return;

    try {
      await addReaction({
        messageId: messageId as Id<"messages">,
        userId: userId as Id<"users">,
        emoji,
      });
      setShowPicker(false);
      onReactionChange?.();
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex flex-wrap gap-1">
        {Object.entries(reactions).map(([emoji, userIds]) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 border border-slate-300 hover:bg-slate-200 text-sm transition-colors"
          >
            <span>{emoji}</span>
            {userIds.length > 0 && <span className="text-xs text-slate-700">{userIds.length}</span>}
          </button>
        ))}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center justify-center w-6 h-6 rounded-full border border-slate-300 bg-white hover:bg-slate-100 text-sm text-slate-700 transition-colors"
          title="Add reaction"
        >
          +
        </button>

        {showPicker && (
          <div className="absolute z-20 bottom-full left-0 bg-white border border-slate-300 rounded-lg shadow-lg p-2 mb-2 flex gap-1">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="text-lg hover:bg-slate-100 p-1 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
