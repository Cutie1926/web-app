"use client";

import React from "react";

interface TypingIndicatorProps {
  users: Array<{ name: string }>;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
  if (users.length === 0) return null;

  const names = users.map((u) => u.name).join(", ");
  const verb = users.length === 1 ? "is" : "are";

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 p-2">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        />
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        />
      </div>
      <span>
        {names} {verb} typing...
      </span>
    </div>
  );
};
