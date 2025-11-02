import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface FastLoadingProps {
  message?: string;
  description?: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'minimal' | 'card' | 'fullscreen';
}

export function FastLoading({ 
  message = 'Loading...', 
  description,
  showRefresh = false,
  onRefresh,
  size = 'md',
  variant = 'minimal'
}: FastLoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const content = (
    <>
      <div className="animate-spin">
        <Loader2 className={`${sizeClasses[size]} text-primary mx-auto`} />
      </div>
      {message && (
        <div className="mt-3 text-center">
          <div className="text-sm font-medium">{message}</div>
          {description && (
            <div className="text-xs text-muted-foreground mt-1">{description}</div>
          )}
        </div>
      )}
      {showRefresh && onRefresh && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          className="mt-3 mx-auto block text-xs px-3 py-1"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      )}
    </>
  );

  if (variant === 'fullscreen') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          {content}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-card border rounded-lg p-6 text-center">
        {content}
      </div>
    );
  }

  // Minimal variant
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      {content}
    </div>
  );
}

interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md';
}

export function InlineLoading({ message = 'Loading...', size = 'sm' }: InlineLoadingProps) {
  return (
    <div className="flex items-center space-x-2">
      <Loader2 className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} animate-spin text-primary`} />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  [key: string]: any;
}

export function LoadingButton({ 
  loading, 
  children, 
  loadingText = 'Loading...', 
  ...props 
}: LoadingButtonProps) {
  return (
    <Button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

// Simple dots animation for very fast loading
export function LoadingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-flex space-x-1 ${className}`}>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}

// Ultra-minimal spinner
export function SimpleSpinner({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${className}`} 
         style={{ width: '1.5rem', height: '1.5rem' }}>
    </div>
  );
}