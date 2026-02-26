"use client";

import Image from "next/image";
import { cn, getAvatarColor, getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
  showStatus?: boolean;
  isOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  size = "md",
  showStatus = false,
  isOnline = false,
}) => {
  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const statusSizeStyles = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const initials = getInitials(name);
  const avatarColor = getAvatarColor(name);

  return (
    <div className="relative inline-flex items-center justify-center">
      <div
        className={cn(
          "relative rounded-full overflow-hidden flex items-center justify-center font-semibold text-white",
          sizeStyles[size],
          !imageUrl && avatarColor
        )}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes={size === "sm" ? "32px" : size === "md" ? "40px" : "48px"}
          />
        ) : (
          initials
        )}
      </div>

      {showStatus && (
        <div
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-white",
            statusSizeStyles[size],
            isOnline ? "bg-green-500" : "bg-gray-400"
          )}
        />
      )}
    </div>
  );
};
