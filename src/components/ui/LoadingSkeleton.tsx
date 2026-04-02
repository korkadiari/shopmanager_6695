import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />;
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-card">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="w-14 h-6 rounded-full" />
      </div>
      <Skeleton className="w-24 h-3 mb-2" />
      <Skeleton className="w-32 h-7 mb-2" />
      <Skeleton className="w-20 h-3" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={`skel-col-${i}`} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return <Skeleton className={`w-full rounded-lg`} style={{ height }} />;
}