"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Check } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface GroupCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  onGroupCreated: (conversationId: string) => void;
}

export const GroupCreateModal: React.FC<GroupCreateModalProps> = ({
  open,
  onOpenChange,
  userId,
  onGroupCreated,
}) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const allUsers = useQuery(
    api.users.getAllUsers,
    open && userId ? { currentUserId: userId as Id<"users"> } : "skip"
  );

  const createGroup = useMutation(api.conversations.createGroup);

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0 || !userId) return;

    try {
      setIsCreating(true);
      const conversationId = await createGroup({
        name: groupName,
        participants: [userId as Id<"users">, ...selectedUsers.map(id => id as Id<"users">)],
        createdBy: userId as Id<"users">,
      });
      onGroupCreated(conversationId);
      setGroupName("");
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Group"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.length === 0 || isCreating}
            isLoading={isCreating}
          >
            Create
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Group Name */}
        <Input
          label="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Enter group name..."
        />

        {/* User Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Members ({selectedUsers.length})
          </label>
          <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
            {allUsers && allUsers.length > 0 ? (
              <div className="divide-y">
                {allUsers?.map((user) => {
                  const isSelected = selectedUsers.includes(user._id);
                  return (
                    <button
                      key={user._id}
                      onClick={() => handleToggleUser(user._id)}
                      className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${
                        isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <Avatar
                        name={user.name}
                        imageUrl={user.avatarUrl}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                      {isSelected && (
                        <Check size={20} className="text-blue-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                No users available
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};
