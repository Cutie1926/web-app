"use client";

import React from "react";
import { formatLastSeen } from "@/lib/dateFormatter";

interface OnlineStatusProps {
  isOnline: boolean;
  lastSeen?: number;
}

export const OnlineStatus: React.FC<OnlineStatusProps> = ({ isOnline, lastSeen }) => {
  if (isOnline) {
    return <span className="text-green-600">Active now</span>;
  }

  if (lastSeen) {
    return <span className="text-gray-500">Last seen {formatLastSeen(lastSeen)}</span>;
  }

  return <span className="text-gray-500">Offline</span>;
};
