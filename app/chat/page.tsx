"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";

export default function ChatPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-500">Select a chat to begin your conversation.</p>
        <div className="mt-4">
          <Button onClick={() => router.push("/chat/new-group")}>Create Group Chat</Button>
        </div>
      </div>
    </div>
  );
}
