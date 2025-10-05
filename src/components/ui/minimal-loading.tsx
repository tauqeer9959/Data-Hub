import React from 'react';

export function MinimalLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export function InlineSpinner({ size = 16 }: { size?: number }) {
  return (
    <div 
      className="inline-block border-2 border-current border-t-transparent rounded-full animate-spin"
      style={{ width: size, height: size }}
    />
  );
}