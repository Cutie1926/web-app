"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Id } from "@/convex/_generated/dataModel";

export const useOnlineStatus = (userId: string | null) => {
  const updateHeartbeat = useMutation(api.presence.updateHeartbeat);
  const goOffline = useMutation(api.presence.goOffline);

  const heartbeatIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!userId) return;

    // Send initial heartbeat
    updateHeartbeat({ userId: userId as Id<"users"> });

    // Send heartbeat every 30 seconds
    heartbeatIntervalRef.current = setInterval(() => {
      updateHeartbeat({ userId: userId as Id<"users"> });
    }, 30000);

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        goOffline({ userId: userId as Id<"users"> });
      } else {
        updateHeartbeat({ userId: userId as Id<"users"> });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Handle page unload
    const handleUnload = () => {
      goOffline({ userId: userId as Id<"users"> });
    };

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [userId, updateHeartbeat, goOffline]);
};
