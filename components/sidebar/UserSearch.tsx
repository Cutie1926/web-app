"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Search, X } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface UserSearchProps {
  userId: string | null;
  onSelectUser: (conversationId: string) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({
  userId,
  onSelectUser,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const searchResults = useQuery(
    api.users.search,
    searchQuery && userId
      ? {
          query: searchQuery,
          currentUserId: userId as Id<"users">,
        }
      : "skip"
  );

  const getOrCreateConversation = useMutation(api.conversations.getOrCreate);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectUser = async (selectedUserId: string) => {
    if (!userId) return;

    try {
      const conversationId = await getOrCreateConversation({
        currentUserId: userId as Id<"users">,
        otherUserId: selectedUserId as Id<"users">,
      });
      onSelectUser(conversationId as string);
      setIsOpen(false);
      setSearchQuery("");
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  return (
    <div className="relative">
      <Input
        placeholder="Search users..."
        onChange={(e) => {
          handleSearch(e.target.value);
          setIsOpen(true);
        }}
        icon={<Search size={16} className="text-gray-400" />}
      />

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10">
          {searchResults && searchResults.length > 0 ? (
            <div className="divide-y">
              {searchResults.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user._id)}
                  className="w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <Avatar name={user.name} imageUrl={user.avatarUrl} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : searchQuery.length > 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No users found
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              Start typing to search...
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <button
          onClick={() => {
            setIsOpen(false);
            setSearchQuery("");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
