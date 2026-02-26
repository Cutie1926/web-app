"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { ConversationList } from "@/components/sidebar/ConversationList";
import { Spinner } from "@/components/loaders";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { UserButton } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const [convexUserId, setConvexUserId] = useState<string | null>(null);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync user with Convex
  const syncUser = useMutation(api.users.sync);

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      router.push("/sign-in");
      return;
    }

    if (user && !convexUserId) {
      const timeoutId = setTimeout(() => {
        setError("Connection timeout. Please check if Convex is running and NEXT_PUBLIC_CONVEX_URL is set.");
      }, 10000);

      syncUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        avatarUrl: user.imageUrl,
      })
        .then((id) => {
          clearTimeout(timeoutId);
          setConvexUserId(id);
          setError(null);
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          setError("Failed to sync user. Please refresh the page.");
          console.error(err);
        });

      return () => clearTimeout(timeoutId);
    }
  }, [isLoaded, userId, user, convexUserId, router, syncUser]);

  // Setup online status tracking
  useOnlineStatus(convexUserId);

  if (!isLoaded || !convexUserId) {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-slate-950 px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.25),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.2),_transparent_40%)]" />
        {error ? (
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-rose-400/30 bg-slate-900/80 p-6 text-center shadow-2xl backdrop-blur">
            <p className="mb-2 text-lg font-semibold text-rose-300">Connection Error</p>
            <p className="text-sm leading-relaxed text-slate-200">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl border border-sky-300/20 bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="relative z-10 rounded-2xl border border-slate-700/60 bg-slate-900/80 p-6 shadow-2xl backdrop-blur">
            <Spinner />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,_rgba(56,189,248,0.16),_transparent_36%),radial-gradient(circle_at_95%_85%,_rgba(14,165,233,0.2),_transparent_32%)]" />

      {/* Sidebar */}
      <aside className="relative hidden w-80 flex-col border-r border-white/10 bg-slate-900/80 text-slate-100 backdrop-blur-xl md:flex">
        {/* Header with user button */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h1 className="bg-gradient-to-r from-sky-300 via-cyan-200 to-white bg-clip-text text-xl font-black tracking-tight text-transparent">
            DS
          </h1>
          <div className="rounded-xl border border-white/10 bg-white/5 p-1">
            <UserButton />
          </div>
        </div>

        <div className="min-h-0 flex-1 px-2 py-2">
          <ConversationList
            userId={convexUserId}
            onSelectConversation={(conversationId) => {
              setActiveConversation(conversationId);
              router.push(`/chat/${conversationId}`);
            }}
            activeConversationId={activeConversation || undefined}
          />
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="relative z-10 flex min-w-0 flex-1 flex-col bg-white/[0.02] text-slate-900">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/70 px-4 py-3 backdrop-blur md:hidden">
          <h1 className="bg-gradient-to-r from-sky-300 to-cyan-100 bg-clip-text text-xl font-black tracking-tight text-transparent">
            DS
          </h1>
          <div className="rounded-xl border border-white/10 bg-white/5 p-1">
            <UserButton />
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
