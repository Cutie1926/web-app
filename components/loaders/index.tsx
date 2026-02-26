"use client";

export const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="w-6 h-6 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
};

export const MessageSkeleton: React.FC = () => {
  return (
    <div className="flex items-end gap-3 mb-4">
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
        <div className="h-12 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
};

export const ConversationSkeleton: React.FC = () => {
  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-3 bg-gray-100 rounded w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
