import React from 'react';
import { GraduationCap, RefreshCw } from 'lucide-react';

interface InstantLoadingProps {
  message?: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

export function InstantLoading({ 
  message = 'Loading Data Hub', 
  showRefresh = false,
  onRefresh 
}: InstantLoadingProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        {/* App Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <GraduationCap className="w-16 h-16 text-primary animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Data Hub</h1>
        </div>

        {/* Loading Animation */}
        <div className="mb-6">
          <div className="flex justify-center space-x-1 mb-4">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <p className="text-muted-foreground">{message}</p>
        </div>

        {/* Refresh Button */}
        {showRefresh && onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        )}
      </div>
    </div>
  );
}

// Ultra-minimal inline loading for components
export function MiniLoading({ size = 16 }: { size?: number }) {
  return (
    <div 
      className="inline-block animate-spin border-2 border-current border-t-transparent rounded-full opacity-50"
      style={{ width: size, height: size }}
    />
  );
}

// Loading overlay for sections
export function SectionLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <MiniLoading size={24} />
        <p className="text-sm text-muted-foreground mt-3">{message}</p>
      </div>
    </div>
  );
}