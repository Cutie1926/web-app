import { format, isToday, isThisYear } from "date-fns";

export const formatMessageTime = (timestamp: number): string => {
  const date = new Date(timestamp);

  if (isToday(date)) {
    // Today: show only time (2:34 PM)
    return format(date, "h:mm a");
  }

  if (isThisYear(date)) {
    // This year: show month and time (Feb 15, 2:34 PM)
    return format(date, "MMM d, h:mm a");
  }

  // Different year: show full date with year (Feb 15, 2023, 2:34 PM)
  return format(date, "MMM d, yyyy, h:mm a");
};

export const formatConversationDate = (timestamp: number): string => {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return format(date, "h:mm a");
  }

  if (isThisYear(date)) {
    return format(date, "MMM d");
  }

  return format(date, "MMM d, yyyy");
};

export const formatLastSeen = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) {
    return "active now";
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays === 1) {
    return "yesterday";
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  return format(date, "MMM d");
};

export const formatGroupTitle = (isGroup: boolean, name?: string, participantCount?: number): string => {
  if (isGroup && name) {
    return `${name}${participantCount ? ` (${participantCount})` : ""}`;
  }
  return name || "Unknown";
};
