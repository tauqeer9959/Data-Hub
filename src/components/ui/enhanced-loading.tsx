import React from 'react';
import { Loader2, RefreshCw, Zap } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dots' | 'pulse' | 'rotate';
  className?: string;
}

export function LoadingSpinner({ size = 'md', variant = 'default', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  if (variant === 'dots') {
    return (
      <div className={`flex space-x-1 ${className}`}>
        <div className={`${sizeClasses[size]} bg-primary rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
        <div className={`${sizeClasses[size]} bg-primary rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
        <div className={`${sizeClasses[size]} bg-primary rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`${sizeClasses[size]} bg-primary rounded-full animate-pulse ${className}`}></div>
    );
  }

  if (variant === 'rotate') {
    return (
      <RefreshCw className={`${sizeClasses[size]} animate-spin text-primary ${className}`} />
    );
  }

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin text-primary ${className}`} />
  );
}

interface LoadingStateProps {
  message?: string;
  description?: string;
  showRefresh?: boolean;
  onRefresh?: () => void;
  variant?: 'default' | 'card' | 'fullscreen';
  spinnerVariant?: 'default' | 'dots' | 'pulse' | 'rotate';
}

export function LoadingState({ 
  message = 'Loading...', 
  description,
  showRefresh = false,
  onRefresh,
  variant = 'default',
  spinnerVariant = 'default'
}: LoadingStateProps) {
  const content = (
    <div className="text-center">
      <LoadingSpinner size="lg" variant={spinnerVariant} className="mx-auto mb-4" />
      <h3 className="font-medium mb-2">{message}</h3>
      {description && (
        <p className="text-muted-foreground text-sm mb-4 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {showRefresh && onRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      )}
    </div>
  );

  if (variant === 'card') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8">
          {content}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {content}
      </div>
    );
  }

  return (
    <div className="py-12">
      {content}
    </div>
  );
}

interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function InlineLoading({ message = 'Loading...', size = 'sm', className = '' }: InlineLoadingProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LoadingSpinner size={size} />
      <span className="text-muted-foreground text-sm">{message}</span>
    </div>
  );
}

interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  [key: string]: any;
}

export function ButtonLoading({ 
  loading, 
  children, 
  loadingText = 'Loading...', 
  className = '', 
  ...props 
}: ButtonLoadingProps) {
  return (
    <Button {...props} disabled={loading || props.disabled} className={className}>
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

interface DataLoadingProps {
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  children: React.ReactNode;
  loadingMessage?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export function DataLoading({
  isLoading,
  error,
  onRetry,
  children,
  loadingMessage = 'Loading data...',
  emptyMessage = 'No data available',
  isEmpty = false
}: DataLoadingProps) {
  if (isLoading) {
    return (
      <LoadingState 
        message={loadingMessage}
        variant="card"
        spinnerVariant="dots"
      />
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="text-destructive mb-4">
            <Zap className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-medium">Something went wrong</h3>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xl">📭</span>
            </div>
            <h3 className="font-medium mb-2">No Data</h3>
            <p className="text-sm">{emptyMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}