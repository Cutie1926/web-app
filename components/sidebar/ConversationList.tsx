"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { ConversationItem } from "./ConversationItem";
import { UserSearch } from "./UserSearch";
import { GroupCreateModal } from "./GroupCreateModal";
import { ConversationSkeleton } from "@/components/loaders";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface ConversationListProps {
  userId: string | null;
  onSelectConversation: (conversationId: string) => void;
  activeConversationId?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  userId,
  onSelectConversation,
  activeConversationId,
}) => {
  const [showGroupModal, setShowGroupModal] = useState(false);

  const conversations = useQuery(
    api.conversations.getConversations,
    userId ? { userId: userId as Id<"users"> } : "skip"
  );

  if (!conversations) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <ConversationSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-300 p-4 space-y-2 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGroupModal(true)}
            title="Create new group"
          >
            <Plus size={20} />
          </Button>
        </div>

        {/* User Search */}
        <UserSearch
          userId={userId}
          onSelectUser={(conversationId) => {
            // Create or get conversation with user
            onSelectConversation(conversationId);
          }}
        />
      </div>

      {/* Conversations or Empty State */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center">
              <p className="text-slate-700 text-base">No conversations yet</p>
              <p className="text-slate-500 text-sm">Start a conversation with someone!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation._id}
                userId={userId}
                conversation={conversation}
                isActive={activeConversationId === conversation._id}
                onClick={() => onSelectConversation(conversation._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Group Create Modal */}
      <GroupCreateModal
        open={showGroupModal}
        onOpenChange={setShowGroupModal}
        userId={userId}
        onGroupCreated={(conversationId) => {
          onSelectConversation(conversationId);
          setShowGroupModal(false);
        }}
      />
    </div>
  );
};
