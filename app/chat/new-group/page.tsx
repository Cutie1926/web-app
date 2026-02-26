"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { GroupCreateModal } from "@/components/sidebar/GroupCreateModal";

export default function NewGroupPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push("/sign-in");
    }
  }, [isLoaded, userId, router]);

  return (
    <GroupCreateModal
      open={showModal}
      onOpenChange={(open) => {
        if (!open) {
          router.back();
        }
        setShowModal(open);
      }}
      userId={userId ?? null}
      onGroupCreated={(conversationId) => {
        router.push(`/chat/${conversationId}`);
      }}
    />
  );
}
