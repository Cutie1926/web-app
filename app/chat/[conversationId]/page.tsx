"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Spinner } from "@/components/loaders";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { ArrowLeft } from "lucide-react";

export default function ConversationPage() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;

  const [convexUserId, setConvexUserId] = useState<string | null>(null);

  // Sync user with Convex
  const syncUser = useMutation(api.users.sync);
  const markAsRead = useMutation(api.unreadMessages.markAsRead);

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      router.push("/sign-in");
      return;
    }

    if (user && !convexUserId) {
      syncUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        avatarUrl: user.imageUrl,
      })
        .then((id) => setConvexUserId(id))
        .catch(console.error);
    }
  }, [isLoaded, userId, user, convexUserId, syncUser, router]);

  // Setup online status tracking
  useOnlineStatus(convexUserId);

  const conversation = useQuery(
    api.conversations.getById,
    convexUserId && conversationId
      ? { conversationId: conversationId as Id<"conversations"> }
      : "skip"
  );

  const conversationParticipants = useQuery(
    api.conversations.getConversationParticipants,
    conversation
      ? { conversationId: conversationId as Id<"conversations"> }
      : "skip"
  );

  useEffect(() => {
    if (!convexUserId || !conversationId) return;

    markAsRead({
      conversationId: conversationId as Id<"conversations">,
      userId: convexUserId as Id<"users">,
    }).catch(console.error);
  }, [convexUserId, conversationId, markAsRead]);

  if (!isLoaded || !convexUserId || !conversation || !conversationParticipants) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  // Get other user info for DMs
  const otherUser = !conversation.isGroup
    ? conversationParticipants.find((p: { _id: string }) => p._id !== convexUserId)
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Mobile back button */}
      <div className="md:hidden border-b border-gray-200 px-4 py-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      <ChatWindow
        conversationId={conversationId}
        currentUserId={convexUserId}
        conversationName={
          conversation.isGroup
            ? conversation.name
            : otherUser?.name
        }
        isGroup={conversation.isGroup}
        participantCount={conversation.participants.length}
        participants={conversationParticipants}
      />
    </div>
  );
}
