import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const convex = new ConvexHttpClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || ""
);

export const syncUserWithConvex = async (user: {
  id: string;
  emailAddresses: Array<{ emailAddress: string }>;
  firstName: string;
  lastName: string;
  imageUrl?: string;
}) => {
  try {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    const email = user.emailAddresses?.[0]?.emailAddress || "";

    const result = await convex.mutation(api.users.sync, {
      clerkId: user.id,
      email,
      name: fullName,
      avatarUrl: user.imageUrl,
    });

    return result;
  } catch (error) {
    console.error("Error syncing user with Convex:", error);
    throw error;
  }
};

type ClerkUserLike = {
  id?: string;
  emailAddresses?: Array<{ emailAddress: string }>;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
};

export const syncUserDataOnInit = async (user: ClerkUserLike | null | undefined) => {
  if (!user) return null;
  if (!user.id) return null;

  try {
    return await syncUserWithConvex({
      id: user.id,
      emailAddresses: user.emailAddresses || [],
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      imageUrl: user.imageUrl,
    });
  } catch (error) {
    console.error("Error syncing user on init:", error);
    return null;
  }
};
