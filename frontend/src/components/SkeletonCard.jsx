import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="glass-card p-4 flex flex-col gap-4 animate-pulse">
      {/* Image Block */}
      <div className="bg-slate-200 rounded-2xl aspect-square w-full"></div>
      
      {/* Category Block */}
      <div className="h-4 bg-slate-200 rounded-lg w-1/3 mt-2"></div>
      
      {/* Name Block */}
      <div className="flex flex-col gap-2">
        <div className="h-5 bg-slate-200 rounded-lg w-full"></div>
        <div className="h-5 bg-slate-200 rounded-lg w-2/3"></div>
      </div>
      
      {/* Action Row */}
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-50">
        <div className="flex flex-col gap-1.5 w-1/2">
          <div className="h-3 bg-slate-200 rounded-md w-1/2"></div>
          <div className="h-5 bg-slate-200 rounded-md w-3/4"></div>
        </div>
        <div className="w-11 h-11 bg-slate-200 rounded-2xl"></div>
      </div>
    </div>
  );
}
