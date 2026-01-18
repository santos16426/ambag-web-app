"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function GroupCardCreditSkeleton() {
  return (
    <div className="relative w-64 h-40 rounded-xl overflow-hidden shadow-lg bg-muted animate-pulse shrink-0">
      {/* Background shimmer */}
      <div className="absolute inset-0 bg-linear-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      </div>

      {/* Card Content */}
      <div className="relative h-full p-4 flex flex-col justify-between">
        {/* Top Section */}
        <div className="flex items-start justify-between">
          <Skeleton className="w-10 h-8 rounded-md" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>

        {/* Bottom Section */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
