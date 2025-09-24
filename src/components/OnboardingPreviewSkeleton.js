import React from 'react';

export default function OnboardingPreviewSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 opacity-60">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-28 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm p-3 flex flex-col justify-between">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="space-y-2">
            <div className="h-2 w-24 bg-gray-200 rounded" />
            <div className="h-2 w-16 bg-gray-200 rounded" />
            <div className="h-2 w-12 bg-gray-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
