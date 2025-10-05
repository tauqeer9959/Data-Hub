import React from 'react';
import { GraduationCap } from 'lucide-react';

interface SimpleLoadingProps {
  message?: string;
}

export function SimpleLoading({ message = 'Loading...' }: SimpleLoadingProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <GraduationCap className="w-12 h-12 text-primary mx-auto animate-pulse" />
        </div>
        <div className="flex justify-center space-x-1 mb-3">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
}

// Ultra-fast loading for immediate display
export function FastLoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-muted-foreground">Data Hub</p>
      </div>
    </div>
  );
}