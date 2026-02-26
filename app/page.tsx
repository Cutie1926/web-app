"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      if (userId) {
        // Redirect authenticated users to chat
        router.push("/chat");
      } else {
        // Redirect unauthenticated users to sign-in
        router.push("/sign-in");
      }
    }
  }, [isLoaded, userId, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">TARS Chat</h1>
        <p className="text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}
